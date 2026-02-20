// namespace é um recurso do TypeScript, não JavaScript
namespace App{   
    // export permite que use esse codigo em outro arquivo
    export interface Draggable {   
      //? DragEvent faz parte de um biblioteca que permite arrastar objetos
      dragStartHandler(event: DragEvent): void;
      dragEndHandler(event: DragEvent): void;
    }
    
    export interface DragTarget {
      dragOverHandler(event: DragEvent): void;
      dragHandler(event: DragEvent): void;
      dragLeaveHandler(event: DragEvent): void;
    }
}