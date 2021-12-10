[![en](https://img.shields.io/badge/lang-en-blue.svg)](./README.md)

# Aplicación de Farming

## Back-end API:

Para arrancar la api en local en el puerto 3000: 
```
npm run start
```

Si se van a hacer modificaciones, se puede arrancar con nodemon:
```
npm run start-dev
```

Para arrancar en otro puerto, hay que modificar en el archivo _index.js_ el valor de la constante port al número de puerto que se quiera.

### Base de datos
La base de datos se genera en el archivo **farming.db** en la carpeta _/data_.

Para visualizarla recomiendo utilizar [SQLiteStudio](https://sqlitestudio.pl/).


## Front-end:

Para el front en local en el puerto 4200: 
```
ng serve
```

Para arrancar en otro puerto, hay que modificar en el archivo _angular.json_ el valor de “port” (dentro de _projects>front>architect>serve>options>port_) al número de puerto que se quiera.

Si se cambia el puerto en la api, hay que ajustar en el front los dos archivos de entorno con el número de puerto nuevo, _environment.ts_ y _environment.prod.ts_ que están en la carpeta _src>environments_.


## Una vez arrancada la aplicación:

En la home, hay un botón **app info** con unas pequeñas instrucciones. Para que funcione bien hay que:

1. **Crear Tokens**: no se podrá añadir un nombre de token o un ticker ya existente en la base de datos.

   **Crear Exchanges**: no se podrá añadir un nombre de exchange ya existente en la base de datos.

   **Crear Clientes**: no se podrá añadir un cliente que coincida en nombre, apellidos y email con otro cliente existente en la base de datos.

2. Con datos añadidos **crear los Pares**, se cargan en la lista los tokens y exhanges creados.

3. **Añadir los pares creados al pool**, una vez añadido un par, dejará de aparecer en la lista de opciones.

4. **Actualizar los pools** con las cantidades diarias. Esta operación solo se puede hacer una vez por día*.

  * _Para hacer pruebas y poder meter más datos, se pueden echar todas las fechas un día para atrás en:_ http://localhost:3000/progress/minusDate


## Herramientas utilizadas

### Back-end
* [Node.Js](https://nodejs.org/es/download/)
* [Sequelize](https://sequelize.org/)
* [SQLiteStudio](https://sqlitestudio.pl/)

### Front-end
* [Angular](https://angular.io/)
