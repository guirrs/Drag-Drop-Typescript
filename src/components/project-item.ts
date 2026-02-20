import { Draggable } from "../models/interface";
import { Component } from "./base-components";
import { Project } from "../models/project";
import { autobind } from "../decorators/autobind";

// ProjectItem Class
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
