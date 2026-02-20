// tres barras é uma ferramenta do ts para adicionar cometarios especiais, exclusico do TS n há no JS
/// <reference path="components/project-input.ts"/>
/// <reference path="components/project-list.ts"/>

namespace App{
  
  new ProjectInput();
  new ProjectList('Ativo');
  new ProjectList('Concluido')
}
