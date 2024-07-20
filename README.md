# TypeScript
* In-build type checking / error checking 
* Type Initialization 
  * const elem = document.getElementById('id') as ElementType
  * const elem: ElementType
* const [elements,setElements] = useState<ElementType[]>([]);
* Object elements suggestions 
  * ```
      const car = {
        color: string,
        tyres: number,
      }
    ```
* function return type
  * ```
      const func = (parameterList):ReturnType => {}
    ```