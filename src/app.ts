//* Interface
interface Draggable {
  //? DragEvent faz parte de um biblioteca que permite arrastar objetos
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dragHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

//* Project Type
enum StatusProject { Finished, Active }
class Project {
  constructor(public id: string, public title: string, public description: string, public people: number, public status: StatusProject) {

  }
}

//* Gerenciamente de estado dos projetos

type Listener<T> = (items: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];
  //* addListener é responsavel por sempre atualizar a lista
  addListener(listernerFn: Listener<T>) {
    this.listeners.push(listernerFn);
  }
}


class ProjectState extends State<Project> {
  private projects: any[] = [];
  private static instance: ProjectState

  //* O Construto impede que existe 2 class ProjectState, que poderiam dar conflito ao codigo
  private constructor() {
    super();
  }

  //* getInstance verifica de esse objeto ja foi inicializado, caso seja denovo, retorna o criado, caso não, cria um novo
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  private NewId(): string {
    let newId = Math.random().toString();

    while (this.projects.some(prj => prj.id === newId)) {
      newId = Math.random().toString();
    }
    return newId
  }

  addProject(title: string, description: string, numPeople: number) {
    const newProject = new Project(
      this.NewId(),
      title,
      description,
      numPeople,
      StatusProject.Active
    );
    this.projects.push(newProject);
    this.updateListeners();

    for (const listernerFn of this.listeners) {
      //? .slice() é responsavel de criar um copia da array, mantendo a original
      listernerFn(this.projects.slice());
    }
  }

  moveProject(projectId: string, newStatus: StatusProject) {
    const project = this.projects.find(prj => prj.id === projectId)
    if(project && project.status !== newStatus){
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners(){
    for(const listenersFn of this.listeners){
      listenersFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//* Validacao
interface Validatable {
  value: string | number;
  required?: boolean;
  minLenght?: number;
  maxLenght?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString.length !== 0;
  }

  if (validatableInput.minLenght != null &&
    typeof validatableInput.value === 'string'
  )
    isValid = isValid && validatableInput.value.length >= validatableInput.minLenght;

  if (validatableInput.maxLenght != null &&
    typeof validatableInput.value === 'string'
  )
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLenght;

  if (validatableInput.min != null &&
    typeof validatableInput.value === 'string'
  )
    isValid = isValid && validatableInput.value.length >= validatableInput.min;

  if (validatableInput.max != null &&
    typeof validatableInput.value === 'string'
  )
    isValid = isValid && validatableInput.value.length <= validatableInput.max;

  return isValid;
}

//* Autobind
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn
    }
  };
  return adjDescriptor;
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    //? importNode é como se fosse um compiador, caso voce ponha como true, ele vai copiar todas as informações do pai e do filho, caso seja falsa, um copia superficial somente do pai
    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild as U;
    if (newElementId)
      this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtBeggin: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeggin ? "afterbegin" : "beforeend", this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void
}

// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 pessoa designada'
    }
    return `${this.project.people} pessoas designadas`
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project;

    this.configure();
    this.renderContent();
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons;
    this.element.querySelector('p')!.textContent = this.project.description;
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    //* dataTranfer serve que ao arrastar os dados, voce carrega os dados
    //* O primeiro parametro voce informa o tipo e o segundo o conteudo
    event.dataTransfer!.setData('text/plain', this.project.id);
    // Voce esta definindo que esta movendo na drag
    event.dataTransfer!.effectAllowed = 'move'
  };

  dragEndHandler(_: DragEvent) {
    console.log('Fim drag')
  };

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[]

  constructor(private type: "Active" | "Finished") {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) { 
    if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain"){
      event.preventDefault();
    }
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.add('droppable');
  };

  dragHandler(event: DragEvent) { 
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(prjId, this.type === 'Active' ? StatusProject.Active : StatusProject.Finished);
  };

  @autobind
  dragLeaveHandler(_: DragEvent) { 
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  };

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    this.element.addEventListener('drop', this.dragHandler)

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if (this.type === "Active")
          return prj.status === StatusProject.Active;
        else
          return prj.status === StatusProject.Finished;
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    //? Esvaziar a lista para os conteudos ja rederezidos não serem duplicados
    listEl.innerHTML = ""
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem,)
    }
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // Valores Inseridos
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }
  renderContent() { }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    }
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLenght: 5
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10
    }

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input');
      return;
    }
    else {
      return [enteredTitle, enteredDescription, +enteredPeople]
    }
  }

  private clearInput() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInput()
    }
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('Active');
const finishedPrjList = new ProjectList('Finished')
