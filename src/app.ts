//* Gerenciamente de estado dos projetos

class ProjectState{
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance : ProjectState

  //* O Construto impede que existe 2 class ProjectState, que poderiam dar conflito ao codigo
  private constructor() {

  }

  //* getInstance verifica de esse objeto ja foi inicializado, caso seja denovo, retorna o criado, caso não, cria um novo
  static getInstance(){
    if(this.instance){
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  private NewId() : string{
    let newId = Math.random().toString();

    while(this.projects.some(prj => prj.id === newId)){
      newId = Math.random().toString();
    }
    return newId
  }

  //* addListener é responsavel por sempre atualizar a lista
  addListener(listernerFn: Function){
    this.listeners.push(listernerFn);
  }

  addProject(title: string, description: string, numPeople: number){
    const newProject = {
      id: this.NewId(),
      title: title,
      description: description,
      numPeople: numPeople
    };
    this.projects.push(newProject);
    for(const listernerFn of this.listeners){
      //* .slice() é responsavel de criar um copia da arry, mantendo a original
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

// ProjectList Class
class ProjectList{
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished'){
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    //* importNode é como se fosse um compiador, caso voce ponha como true, ele vai copiar todas as informações do pai e do filho, caso seja falsa, um copia superficial somente do pai
    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`; 

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for(const prjItem of this.assignedProjects){
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent(){
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private attach(){
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

class ProjectInput {
  // Rederizacao
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  // Valores Inseridos
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
    this.attach();
  }

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
      projectState.addProject(title,desc,people);
      this.clearInput()
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished')
