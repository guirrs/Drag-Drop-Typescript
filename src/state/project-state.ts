namespace App{
      //* Gerenciamente de estado dos projetos
  
  type Listener<T> = (items: T[]) => void;
  class State<T> {
    protected listeners: Listener<T>[] = [];
    //* addListener é responsavel por sempre atualizar a lista
    addListener(listernerFn: Listener<T>) {
      this.listeners.push(listernerFn);
    }
  }
  
  
  export class ProjectState extends State<Project> {
    private projects: Project[] = [];
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
  
  export const projectState = ProjectState.getInstance();  
}