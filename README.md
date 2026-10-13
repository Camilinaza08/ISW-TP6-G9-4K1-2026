# ISW-G9-4K1-2026

## Trabajo Práctico N.º 6 (TP6)

### Decisiones de Diseño y Organización del Desarrollo

Documento del **Grupo 9 (Curso 4K1 - Año 2026)** de la materia **Ingeniería y Calidad de Software (UTN-FRC)**.

**Proyecto:** EcoHarmony Park  
**Historia de usuario:** Comprar entradas

### Integrantes del Grupo

- **Nombre:** Calderón, Ana Victoria - **Legajo:** 402851 - **Usuario:** viccalderon
- **Nombre:** Díaz, Brisa Abigaíl - **Legajo:** 97287 - **Usuario:** BrisaDiaz
- **Nombre:** Escudero Olivera, Matías Rubén - **Legajo:** 402434 - **Usuario:** escuderomann
- **Nombre:** Fuertes Galera, Emiliano - **Legajo:** 402186 - **Usuario:** emolianito
- **Nombre:** Galetto, Fiorella - **Legajo:** 400305 - **Usuario:** fiorellag26
- **Nombre:** Gorosito, Tamara - **Legajo:** 90740 - **Usuario:** tamaraMG
- **Nombre:** Guevara Lopez, Joaquin - **Legajo:** 300543 - **Usuario:** joaquinsinho
- **Nombre:** Juri Romero, Agustina - **Legajo:** 95317 - **Usuario:** agustinajuri18
- **Nombre:** Linaza, Camila - **Legajo:** 402370 - **Usuario:** camilinaza08
- **Nombre:** Maccio, Tomás Agustín - **Legajo:** 400057 - **Usuario:** maccio-bit
- **Nombre:** Pizarro, José Francisco - **Legajo:** 402123 - **Usuario:** franpi19
- **Nombre:** Rigonatto, Enzo - **Legajo:** 400629 - **Usuario:** rigonattoenzo
- **Nombre:** Torrens Valsagna, Francisco - **Legajo:** 401939 - **Usuario:** frantorrens

### Objetivo

El objetivo de este documento es **establecer y justificar las decisiones de diseño y organización del trabajo** que adoptará el Grupo 9 para desarrollar la historia de usuario **«Comprar entradas»** del proyecto EcoHarmony Park, correspondiente al TP6 de Ingeniería y Calidad de Software.

Para ello, se definirán la metodología de desarrollo, la organización y seguimiento de tareas, las convenciones de trabajo en el repositorio y las herramientas que se utilizarán para implementar el frontend, el backend y las pruebas.

Además, se establecerá cómo se utilizará el documento de diseño de tests para guiar el desarrollo mediante TDD en el backend, buscando mantener un trabajo organizado, progresivo y coordinado entre los integrantes del grupo.

## 1. Metodología de trabajo

Para desarrollar la historia de usuario **«Comprar entradas»** de EcoHarmony Park, decidimos adoptar un enfoque de trabajo **Just-in-Time (JIT)**, acompañado de **Test-Driven Development (TDD)** para el backend.

La idea es avanzar progresivamente, implementando las funcionalidades a medida que sean necesarias y evitando desarrollar anticipadamente comportamientos que todavía no fueron definidos o validados.

### Desarrollo Just-in-Time

Trabajaremos desarrollando únicamente las funcionalidades necesarias para cumplir con los requerimientos que estemos abordando en cada momento.

Este criterio también se aplicará a la **instalación de librerías y dependencias**: incorporaremos cada herramienta cuando sea necesaria para implementar una funcionalidad concreta, evitando instalar anticipadamente paquetes que todavía no utilizaremos. Esto no impide identificar desde el inicio las tecnologías previstas para el proyecto.

Cuando existan reglas de negocio pendientes de confirmación por parte de los Product Owners (PO), evitaremos implementar soluciones basadas en suposiciones hasta contar con las definiciones correspondientes.

### Desarrollo guiado por pruebas (TDD)

Para el **backend** utilizaremos TDD, siguiendo el ciclo **RED → GREEN → REFACTORING**:

- **RED:** escribir un test que represente el comportamiento esperado y comprobar que falle porque todavía no está implementado.
- **GREEN:** desarrollar la solución mínima necesaria para que el test pase.
- **REFACTORING:** revisar y mejorar el código, manteniendo el comportamiento validado por los tests.

Utilizaremos el documento de diseño de tests como guía para seleccionar los comportamientos que debemos implementar, respetando las dependencias entre funcionalidades. Cuando un comportamiento ya esté cubierto, los tests permitirán comprobarlo y detectar regresiones, sin introducir fallos artificiales.

### Desarrollo y validación del frontend

Para el **frontend no utilizaremos TDD**. Su desarrollo será incremental, siguiendo las funcionalidades y los flujos definidos para la historia de usuario.

La validación de la interfaz se realizará principalmente mediante **pruebas manuales**, comprobando navegación, visualización de información, validación de campos, mensajes de error e interacción con el backend. No se establece un proceso de tests automatizados del frontend como requisito de desarrollo.

### Pruebas de integración

Además de los tests unitarios del backend, realizaremos **tests de integración por secciones** a medida que se completen conjuntos de funcionalidades relacionadas. Estos permitirán verificar su funcionamiento conjunto antes de avanzar con nuevas funcionalidades.

Finalmente, realizaremos **pruebas de integración generales** para comprobar el flujo completo de la historia de usuario, incluyendo la comunicación entre frontend y backend y las integraciones con Mercado Pago y el correo electrónico, mediante entornos de prueba cuando corresponda.

### Aplicación de la metodología

1. Seleccionar el siguiente comportamiento o funcionalidad a desarrollar.
2. Revisar los requerimientos y los tests diseñados correspondientes.
3. Incorporar las dependencias necesarias siguiendo Just-in-Time.
4. Desarrollar el backend mediante TDD y el frontend de forma incremental, con validaciones manuales.
5. Ejecutar los tests unitarios y de integración correspondientes a cada sección.
6. Realizar las pruebas de integración finales cuando las funcionalidades necesarias estén integradas.

## 2. Diseño y ejecución de tests

Para organizar el desarrollo de la historia de usuario **«Comprar entradas»**, elaboramos un documento de diseño de tests que utilizaremos como **guía principal para implementar las funcionalidades**.

**Documento de diseño de tests:** [Consultar documento](https://docs.google.com/document/d/1xAag-ZQ_8GOCsUTlcpvT7BRRXt9hMKkd67Q2byAMbro/edit?usp=sharing)

Este documento establece los comportamientos que debemos verificar, las funciones involucradas y los tests que orientarán el desarrollo del backend mediante TDD. También incluye la división de tareas del frontend.

### Organización del documento

El documento se divide en secciones que siguen las principales funcionalidades de la historia de usuario:

1. **Validación del usuario:** condiciones necesarias para iniciar una compra.
2. **Validación de fechas:** fecha seleccionada y condiciones de apertura del parque.
3. **Cantidad de entradas:** límites y formato de la cantidad solicitada.
4. **Datos obligatorios:** edades y tipos de pase correspondientes a cada entrada.
5. **Forma de pago:** medios de pago admitidos.
6. **Cálculo del monto:** importe de la compra según las entradas seleccionadas.
7. **Envío de correos electrónicos:** generación, validación y envío de la información de confirmación.
8. **Integración con Mercado Pago:** creación de preferencias, verificación de estados y procesamiento de notificaciones.
9. **Pruebas de integración finales:** funcionamiento conjunto de las funcionalidades desarrolladas.

Además, se incorporó una sección para la **división de tareas del frontend**, destinada a identificar componentes y funcionalidades de la interfaz y facilitar la distribución del trabajo.

### Estructura de definición de los tests

Dentro de cada sección, los tests están **numerados y organizados por comportamiento**. Para cada uno se describe la función o funcionalidad involucrada, la situación que se pretende comprobar y el resultado esperado.

Esta organización permite identificar qué debe cumplir el sistema y ofrece una referencia común para que los integrantes implementen los tests automatizados y las funcionalidades asociadas. Se trata de un **diseño de tests**, no de una especificación formal de casos de prueba.

### Tests de integración por secciones

El documento contempla **tests de integración dentro de las secciones**, destinados a comprobar el funcionamiento conjunto de funciones relacionadas. Se ejecutarán cuando estén disponibles las funcionalidades involucradas, sin esperar a completar el sistema.

### Pruebas de integración finales

También incluye una sección de **pruebas de integración finales**, orientadas a verificar el recorrido completo de compra: validaciones, procesamiento del pago y correo de confirmación cuando corresponda.

Estas comprobaciones abarcarán la interacción entre frontend, backend y servicios externos, utilizando los entornos de prueba correspondientes.

### División de tareas del frontend

Como el frontend no se desarrollará mediante TDD, el documento identifica por separado las tareas necesarias para implementar la interfaz. Su validación será principalmente manual y se coordinará con la integración del backend.

### Uso del documento durante el desarrollo

El documento será nuestra **referencia para planificar, distribuir e implementar el trabajo**. Seleccionaremos los tests y tareas de cada funcionalidad y avanzaremos de acuerdo con los comportamientos descritos, ajustando la secuencia según dependencias técnicas y decisiones pendientes de los PO.

Los tests de integración por secciones acompañarán el avance, y las pruebas finales comprobarán el funcionamiento completo cuando los componentes estén integrados.

## 3. Organización del trabajo con Trello

Utilizaremos **Trello** para organizar y seguir las tareas del TP6 mediante un tablero compartido.

**Tablero de Trello:** [Acceder al tablero](https://trello.com/invite/b/6ac868137864683777b83caf/ATTI8ecb0cb628244f539690a4f0e08e27e8C4E827D5/tp6)

El objetivo será visualizar el avance, facilitar la distribución de tareas y evitar concentrar el trabajo en los últimos días.

### Estructura del tablero

El tablero tendrá tres columnas:

- **To Do:** tareas pendientes.
- **Doing:** tareas en desarrollo.
- **Done:** tareas finalizadas según los criterios establecidos.

Cada tarjeta de test tendrá como título su **número y nombre**, según el documento de diseño. Utilizaremos **etiquetas de colores para distinguir las secciones**.

### Información de las tarjetas

Cada tarjeta de test incluirá:

- Número y nombre del test.
- Etiqueta de color de su sección.
- **Fecha de vencimiento tentativa**, como referencia para promover un avance progresivo y no como plazo rígido.
- **Enlace al pseudocódigo** del test en el documento de diseño.

Si un test no puede completarse en la fecha prevista, se consultará nuevamente su sección en el documento de diseño para revisar lo pendiente y reorganizar su continuación; no se considerará completado por el solo vencimiento de la fecha.

### Asignación y seguimiento

Trabajaremos con **autoasignación según disponibilidad**. Cuando un integrante tenga tiempo, elegirá una tarjeta de **To Do**, se asignará como responsable y la moverá a **Doing**. Cuando cumpla el criterio de finalización, la moverá a **Done**.

### Criterios para considerar una tarea finalizada

- **Test unitario del backend:** se realizaron los **tres commits** correspondientes a RED, GREEN y REFACTORING y el test pasa correctamente.
- **Test de integración por sección:** el test de integración se implementó, se ejecutó satisfactoriamente y se registró su commit.
- **Prueba de integración final:** la comprobación correspondiente se completó satisfactoriamente y se registró su commit.
- **Tarea del frontend:** la funcionalidad está implementada y se verificó manualmente su funcionamiento.

### Organización del frontend y fecha límite

El tablero incluirá las tareas del frontend según la división establecida en el documento de diseño.

Para todas ellas fijamos como **fecha límite el martes 20 de octubre de 2026 a las 23:59 h**, de modo que el **miércoles 21 de octubre de 2026** podamos realizar las pruebas finales de integración del sistema.

## 4. Gestión de cambios y commits

Utilizaremos **Git y GitHub** para registrar los cambios y seguir la evolución del TP6.

**Repositorio de GitHub:** [Acceder al repositorio](https://github.com/Camilinaza08/ISW-TP6-G9-4K1-2026)

La convención de commits diferenciará el backend del frontend, ya que TDD se aplicará únicamente al primero.

### Formato de los commits del backend

Usaremos el formato:

`Test [Nro] - [Nombre] - [Fase]`

- **[Nro]:** número según el documento de diseño de tests.
- **[Nombre]:** nombre del test o prueba definido en el documento.
- **[Fase]:** etapa TDD o tipo de integración correspondiente.

Las opciones para **[Fase]** serán:

| Fase | Significado |
|---|---|
| `RED` | Se incorpora el test unitario y se comprueba que falla. |
| `GREEN` | Se implementa lo necesario para que el test pase. |
| `REFACTORING` | Se revisa y mejora el código, conservando el comportamiento validado. |
| `Test de Integración` | Se implementa y ejecuta un test de integración de una sección. |
| `Prueba de Integración` | Se ejecuta y verifica una prueba de integración final. |

### Commits de tests unitarios

Por cada test unitario del backend realizaremos **tres commits**:

1. **RED:** incorporación del test y comprobación del fallo.
2. **RED → GREEN:** implementación mínima para superar el test.
3. **GREEN → REFACTORING:** revisión y refactorización, manteniendo los tests funcionando correctamente.

Ejemplo:

```text
Test 22 - Validar cantidad mínima - RED
Test 22 - Validar cantidad mínima - GREEN
Test 22 - Validar cantidad mínima - REFACTORING
```

### Commits de integración

Tanto los **tests de integración por secciones** como las **pruebas de integración finales** tendrán **un único commit por test o prueba**, una vez implementados y ejecutados satisfactoriamente. Se utilizarán, respectivamente, las fases `Test de Integración` y `Prueba de Integración`.

### Commits del frontend

En el frontend **no aplicaremos TDD**, por lo que no exigiremos tres commits por tarea ni el formato de los tests del backend. Los mensajes deberán ser **claros y representativos** de la funcionalidad o modificación realizada.

## 5. Estructura del repositorio

Definimos una estructura sencilla que separa frontend y backend y organiza el código del backend según las secciones del documento de diseño de tests.

### Estructura general

```text
backend/
├── src/
│   ├── server.js                    # Configuración de Express y rutas principales
│   └── services/
│       ├── ticket/                  # Módulo / Servicio de Entradas
│       │   ├── ticket.service.js    # Lógica de negocio (compra, fechas, montos)
│       │   ├── ticket.validator.js  # Validaciones de campos obligatorios, rangos y tipos
│       │   └── ticket.service.test.js# Tests unitarios (TDD) para el servicio
│       │
│       ├── mercadopago/             # Módulo / Servicio de Pago
│       │   ├── mercadopago.service.js# Integración y preferencias con Mercado Pago
│       │   └── mercadopago.service.test.js# Tests unitarios con mocks
│       │
│       └── mail/                    # Módulo / Servicio de Correo
│           ├── mail.service.js      # Generación (Handlebars) y envío (Nodemailer)
│           └── mail.service.test.js # Tests unitarios de generación y envío
│
├── tests/
│   └── integration/
│       └── compra.integration.test.js # Pruebas de integración que unen los servicios
│
└── package.json
```

Los nombres de archivos podrán ajustarse a las funciones efectivamente implementadas, conservando la organización por secciones. Los tests de integración por sección estarán junto con sus funcionalidades; las pruebas finales tendrán carpeta propia.

### Organización del frontend

La carpeta **Frontend** reunirá los componentes y archivos de la interfaz. Su organización interna se definirá según las tareas del documento de diseño y las necesidades que aparezcan durante el desarrollo.

### Organización del backend

Cada sección funcional tendrá su carpeta, con archivos de implementación y tests ubicados juntos. Los **mocks**, cuando sean necesarios, se mantendrán en la carpeta de la funcionalidad correspondiente.

### Comunicación entre frontend y backend

El archivo **`server.js`** configurará Express y expondrá inicialmente el endpoint HTTP necesario para iniciar una compra.

Al presionar el botón **«Comprar entradas»**, el frontend enviará una solicitud al backend. El endpoint invocará **`comprarEntradas()`**, que coordinará las validaciones y operaciones correspondientes. El frontend no llamará directamente a las funciones internas del backend.

No incorporaremos inicialmente una estructura adicional de controladores o carpetas de rutas. Si aparecen nuevos requerimientos, como un endpoint para notificaciones de Mercado Pago, los agregaremos **Just-in-Time**.

### Funcionalidad central de compra

La carpeta **ComprarEntradas** contendrá `comprarEntradas()` y sus tests. Esta función coordinará las funcionalidades del backend necesarias para procesar una compra, de acuerdo con las reglas de negocio confirmadas.

### Pruebas de integración finales

La carpeta **PruebasIntegracionFinal** reunirá los tests automatizados destinados a comprobar el funcionamiento conjunto del backend. Las comprobaciones del recorrido completo desde la interfaz y de los servicios externos se complementarán con las verificaciones manuales y en entornos de prueba que correspondan.

### Middlewares

La carpeta **Middlewares** será opcional y contendrá, únicamente cuando se necesiten, componentes para el procesamiento de solicitudes HTTP, como el manejo de errores.

### Justificación de la estructura

Esta organización permite mantener **cada funcionalidad junto con sus tests**, relacionar el código con el documento de diseño y facilitar el trabajo paralelo. Centralizar la compra en `comprarEntradas()` evita introducir capas innecesarias para el alcance del TP6.

## 6. Herramientas del frontend

Para desarrollar la interfaz de EcoHarmony Park contemplamos tecnologías que permitan construir una aplicación web funcional, **responsive** y organizada en componentes reutilizables.

### Tecnologías previstas

| Herramienta | Utilización |
|---|---|
| **React** | Construcción de la interfaz mediante componentes reutilizables. |
| **JavaScript** | Lógica de interacción y comunicación con el backend. |
| **Vite** | Configuración, servidor de desarrollo y generación de la aplicación. |
| **CSS** | Personalización de estilos y adaptación visual. |
| **Bootstrap** | Componentes prediseñados y utilidades responsive. |
| **Tailwind CSS** | Clases de utilidad para personalización y diseño adaptable. |

### Justificación de las herramientas

**React.** Permite dividir la interfaz en componentes independientes, una ventaja para las etapas de selección de fecha, cantidad y tipo de entradas, resumen, pago y resultado. Esta división facilita distribuir tareas entre integrantes y actualizar dinámicamente la información sin recargar la página. También permite gestionar datos ingresados, errores, operaciones en curso y respuestas del backend.

**JavaScript.** Se utilizará para capturar datos de formularios, controlar la interacción, presentar mensajes y realizar solicitudes HTTP al backend. Las validaciones de interfaz mejorarán la experiencia de uso, pero **no reemplazarán las validaciones de negocio del servidor**.

**Vite.** Ofrece una configuración inicial ágil, un servidor de desarrollo que facilita visualizar cambios y herramientas para generar la aplicación. Resulta útil para un equipo que trabajará en distintos componentes con tiempos acotados.

**CSS.** Permitirá establecer una identidad visual consistente para EcoHarmony Park, ajustar tipografías, colores, espaciados y distribución, y resolver necesidades específicas de estilo.

**Bootstrap.** Se contempla por sus componentes y utilidades responsive, que pueden agilizar la implementación de formularios, botones, mensajes y estructuras de página. Esto puede contribuir a cumplir los plazos y mantener coherencia visual entre aportes del equipo.

**Tailwind CSS.** Se contempla como alternativa de personalización mediante clases de utilidad, especialmente si buscamos diseños específicos sin depender de estilos predeterminados. **Bootstrap y Tailwind se evaluarán como alternativas**, evitando instalar o utilizar ambas cuando resulte redundante.

### Diseño responsive

Buscaremos que el proceso de compra pueda utilizarse desde computadoras, tablets y teléfonos móviles. Prestaremos atención a la legibilidad, la disposición de formularios, el tamaño de controles y la claridad del resumen de compra.

### Criterios de implementación

El frontend seguirá la división de tareas del documento de diseño. **No aplicaremos TDD** y validaremos su funcionamiento principalmente de manera manual. Las herramientas previstas se incorporarán **Just-in-Time**, descartando las que finalmente no aporten valor.

## 7. Herramientas del backend

Utilizaremos **Node.js + Express**, con JavaScript, para implementar las funcionalidades del backend y la comunicación con el frontend y los servicios externos.

### Tecnologías previstas

| Herramienta | Utilización |
|---|---|
| **Node.js** | Ejecución de JavaScript en el servidor. |
| **Express** | Configuración del servidor HTTP y definición de endpoints. |
| **JavaScript** | Implementación de validaciones y lógica de compra. |
| **npm** | Administración de dependencias y scripts del proyecto. |

### Justificación de las herramientas

**Node.js.** Permite utilizar JavaScript también en el servidor, reduciendo la necesidad de trabajar con distintos lenguajes. Se utilizará para implementar las funciones previstas en el diseño, como `validarFecha()`, `validarCantidadEntradas()`, `calcularMonto()` y `comprarEntradas()`. Es adecuado para la comunicación con servicios externos como Mercado Pago y el correo electrónico, y permite integrar herramientas de testing automatizado.

**Express.** Facilita recibir solicitudes HTTP del frontend y responder a ellas sin imponer una arquitectura compleja. Inicialmente, configuraremos el endpoint de compra en `server.js`, que invocará `comprarEntradas()`. Los endpoints adicionales, como los de notificaciones de pago, se incorporarán cuando sean necesarios.

**JavaScript.** Se utilizará para las reglas de negocio, validaciones, cálculo del monto y coordinación de la compra. La separación de funciones facilitará probarlas individualmente y reutilizarlas.

**npm.** Permitirá instalar dependencias, registrar las versiones utilizadas y ejecutar scripts, ayudando a que los integrantes reproduzcan el entorno de desarrollo. Las instalaciones seguirán el criterio Just-in-Time.

### Organización y criterios de implementación

El backend seguirá la estructura por secciones definida anteriormente y se desarrollará mediante **TDD**, respetando el ciclo RED → GREEN → REFACTORING y las convenciones de commits del equipo.

## 8. Herramientas de testing

Para implementar y ejecutar los tests automatizados del backend utilizaremos **Jest**, un framework de testing para JavaScript.

### Herramienta seleccionada

| Herramienta | Utilización |
|---|---|
| **Jest** | Tests unitarios y de integración del backend, con mocks para simular dependencias. |

### Justificación de Jest

Elegimos Jest porque reúne las funciones necesarias para escribir, organizar y ejecutar tests del backend en JavaScript. Su uso es adecuado para TDD, ya que permite comprobar el resultado de cada etapa **RED → GREEN → REFACTORING**.

Lo utilizaremos para verificar las funciones del documento de diseño, como `validarUsuario()`, `validarFecha()`, `validarCantidadEntradas()`, `validarCamposObligatorios()` y `calcularMonto()`.

Sus **mocks** permitirán simular respuestas de servicios externos y probar comportamientos de correo electrónico y Mercado Pago sin depender de una conexión real en cada ejecución. También facilitará detectar regresiones al modificar código existente.

### Aplicación durante el desarrollo

En los tests unitarios seguiremos el ciclo TDD. También utilizaremos Jest para **tests de integración por secciones** y para los **tests automatizados de integración final del backend**.

Cuando una verificación dependa de servicios externos, combinaremos los tests con mocks y las comprobaciones específicas en entornos de prueba. El frontend, por decisión del equipo, se validará principalmente de forma manual y no seguirá TDD.

Jest se instalará y configurará cuando comencemos a implementar los tests, respetando Just-in-Time.

## 9. Herramientas para el manejo de correos electrónicos

Para el correo de confirmación de compra utilizaremos **Nodemailer, Handlebars y Mailtrap**, separando la generación del contenido, el envío y las pruebas.

### Tecnologías previstas

| Herramienta | Utilización |
|---|---|
| **Nodemailer** | Envío de correos desde Node.js mediante SMTP. |
| **Handlebars** | Generación y personalización de contenido HTML. |
| **Mailtrap** | Captura y visualización de correos en un entorno de pruebas. |

### Justificación de las herramientas

**Nodemailer.** Permitirá enviar confirmaciones desde el backend cuando la compra esté efectivamente confirmada, según las reglas establecidas. Mantener el envío separado de `comprarEntradas()` facilitará las pruebas y el mantenimiento.

**Handlebars.** Permitirá construir correos HTML a partir de plantillas y datos dinámicos, como nombre del usuario, número de compra, fecha de visita, entradas y monto. Esta separación facilitará adaptar la presentación a las indicaciones de los Product Owners sin modificar la lógica de envío.

**Mailtrap.** Permitirá capturar y revisar mensajes en un entorno de pruebas, sin enviarlos a destinatarios reales. Servirá para verificar contenido, formato y la integración entre la generación del mensaje y su envío.

### Integración con el proceso de compra

1. Cuando una compra esté confirmada, el backend preparará sus datos.
2. **Handlebars** generará el contenido HTML.
3. **Nodemailer** enviará el mensaje.
4. Durante las pruebas, **Mailtrap** permitirá recibirlo y revisarlo.

La confirmación de la compra y el envío del correo serán operaciones distintas: **un error de correo no debe revertir un pago ya confirmado**.

### Testing y criterios de implementación

Con **Jest** verificaremos las funciones de generación, validación y envío, usando mocks cuando corresponda. Luego realizaremos pruebas de integración con Mailtrap para revisar el funcionamiento conjunto y la presentación de los mensajes.

Las herramientas se incorporarán cuando se desarrolle esta funcionalidad, siguiendo Just-in-Time.

## 10. Integración con Mercado Pago

Para implementar el pago de entradas utilizaremos **Mercado Pago Checkout Pro**, el **SDK oficial para Node.js** y la **API de preferencias de pago**, exclusivamente mediante los mecanismos oficiales de prueba.

El objetivo es simular pagos y verificar sus distintos resultados **sin realizar transacciones monetarias reales**.

### Tecnologías previstas

| Herramienta | Utilización |
|---|---|
| **SDK oficial de Mercado Pago para Node.js** | Comunicación del backend con la API. |
| **Checkout Pro** | Interfaz de pago proporcionada por Mercado Pago. |
| **API de preferencias de pago** | Preparación de los datos para iniciar el pago. |
| **Jest y mocks** | Simulación de respuestas para aplicar TDD. |
| **Webhooks** | Recepción de notificaciones de estados de pago. |
| **Credenciales, cuentas y medios de pago de prueba** | Verificación de escenarios sin dinero real. |

### Justificación de las herramientas

**SDK oficial y preferencias de pago.** Permiten integrar Mercado Pago con Node.js y preparar solicitudes con las entradas, importes y una referencia asociada a la compra. **El monto se calculará en el backend**, sin confiar únicamente en los valores enviados por la interfaz.

**Checkout Pro.** Permite utilizar la interfaz de pago de Mercado Pago, evitando desarrollar un formulario propio para ingresar datos de tarjetas. Simplifica el alcance del TP6 y reduce el tratamiento de información sensible.

**Jest y mocks.** Permitirán desarrollar mediante TDD la preparación y creación de preferencias, la verificación de estados y el procesamiento de notificaciones. Simularemos pagos aprobados, pendientes, rechazados y errores sin depender del servicio externo en cada ejecución.

**Webhooks.** Permitirán recibir notificaciones de cambios de estado. Antes de confirmar una compra, el backend deberá verificar la autenticidad de la notificación y consultar la operación en Mercado Pago. También evitaremos que notificaciones duplicadas generen confirmaciones o correos repetidos.

**Mecanismos oficiales de prueba.** Utilizaremos exclusivamente credenciales, cuentas y medios de pago de prueba para verificar la integración sin cobros reales.

### Integración con el proceso de compra

1. El usuario seleccionará Mercado Pago desde el frontend.
2. El backend validará la compra y calculará el monto.
3. Se preparará y creará la preferencia de pago.
4. El frontend permitirá continuar hacia Checkout Pro.
5. Mercado Pago informará el resultado mediante los mecanismos correspondientes.
6. El backend verificará el estado del pago y su asociación con la compra.
7. **Solo ante un pago aprobado y verificado** se confirmará la compra y se habilitará el correo correspondiente.

**Crear una preferencia o regresar desde Checkout Pro no equivale a un pago aprobado.**

### Testing y pruebas de integración

Aplicaremos TDD con Jest y mocks para las funciones individuales. Después verificaremos la creación de preferencias, Checkout Pro y los estados de pago mediante los mecanismos oficiales de prueba. Finalmente, integraremos estas comprobaciones con `comprarEntradas()` y el envío de correos.

### Restricciones de seguridad

- No utilizar credenciales de producción.
- No utilizar tarjetas ni cuentas reales para ejecutar pagos.
- No realizar transacciones monetarias reales.
- No recopilar ni almacenar información sensible de tarjetas.
- Mantener las credenciales privadas fuera del repositorio, mediante variables de entorno.
- Utilizar exclusivamente mecanismos oficiales de prueba.
- Verificar desde el backend el estado, importe, moneda y asociación del pago antes de confirmar la compra.

El SDK y sus configuraciones se incorporarán siguiendo Just-in-Time.

## 11. Uso de Inteligencia Artificial

Durante el TP6 contemplamos el uso de herramientas de **Inteligencia Artificial (IA)** como apoyo para organizar, implementar y revisar las funcionalidades de **«Comprar entradas»** de EcoHarmony Park.

Su utilización busca facilitar tareas concretas, resolver dudas y mejorar la comprensión técnica, **sin reemplazar el trabajo ni las decisiones del equipo**.

### Aplicaciones previstas

- **Investigación y consultas técnicas:** comprensión de herramientas, documentación y alternativas de implementación.
- **Asistencia en la implementación:** ejemplos y sugerencias de código para frontend y backend.
- **Apoyo durante TDD:** interpretación de errores y consultas sobre RED, GREEN y REFACTORING.
- **Detección de errores:** análisis de fallos y evaluación de posibles soluciones.
- **Revisión de código:** mejoras de legibilidad, organización y mantenimiento.
- **Documentación:** apoyo en la organización, redacción y revisión de los documentos del TP6.

### Criterios de utilización

- Las sugerencias de IA deberán ser **revisadas y comprendidas** antes de incorporarse.
- El código sugerido se adaptará a los requerimientos y se verificará mediante tests o validaciones manuales.
- No se utilizará IA para inventar reglas de negocio pendientes de confirmación por los Product Owners.
- Las decisiones de diseño y la aprobación de resultados serán responsabilidad del grupo.
- No se compartirán credenciales, claves ni información sensible con herramientas de IA.

### Relación con la metodología

Recurriremos a la IA **Just-in-Time**, ante necesidades concretas. En el backend podrá apoyar el análisis de errores y la revisión de implementaciones, pero **no sustituirá la ejecución real de tests ni la evidencia del ciclo TDD**. En el frontend podrá ayudar con componentes y estilos que deberán validarse manualmente.

De esta manera, buscamos aprovechar la IA como herramienta de asistencia, manteniendo la responsabilidad técnica y académica del equipo sobre el resultado final.
