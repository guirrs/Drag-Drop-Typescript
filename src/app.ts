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
    for (const listernerFn of this.listeners) {
      //? .slice() é responsavel de criar um copia da array, mantendo a original
      listernerFn(this.projects.slice());
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

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "Active" | "Finished") {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    //? Esvaziar a lista para os conteudos ja rederezidos não serem duplicados
    listEl.innerHTML = ""
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  configure() {
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
}

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
