
// Component Base Class
//? default permite ser a exportação padrao, podendo adicionar direto no projeto sem especificar
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
