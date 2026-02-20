import { Component } from "./base-components";
import { DragTarget, } from "../models/interface";
import { Project, StatusProject } from "../models/project";
import { autobind } from "../decorators/autobind";
import { projectState} from "../state/project-state";
import { ProjectItem } from "./project-item";

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[]

    constructor(private type: "Ativo" | "Concluido") {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
        }
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
    };

    @autobind
    dragHandler(event: DragEvent) {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'Ativo' ? StatusProject.Active : StatusProject.Finished);
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
                if (this.type === "Ativo")
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
        this.element.querySelector('h2')!.textContent = 'Projetos ' + this.type.toUpperCase();
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