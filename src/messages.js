// Cada línea es una frase completa, editada a mano. Los bancos no se mezclan.
const special = {
  esperanza: `Espero que la vida esté siendo amable contigo.
Que mañana encuentre una ventana abierta en tus días.
Incluso la noche más larga guarda un principio de luz.
Ojalá algo pequeño te devuelva hoy la ilusión.
Hay primaveras que todavía no conocen tu nombre.
Que cada amanecer te encuentre un poco más en paz.
Todavía quedan cielos que te van a sorprender.
Deseo que la alegría vuelva a encontrarte sin avisar.`,
  cariño: `Hay cariños que aprendieron a existir sin pedir nada.
Siempre tendrás un lugar bonito en mi corazón.
Tu nombre sigue teniendo una música tranquila.
Esta galaxia no te pide nada; solo te regala un instante bonito.
Hay ternuras que el tiempo vuelve más silenciosas.
Estas flores llevan un cariño que no necesita respuesta.
Pensarte con ternura es una forma pequeña de agradecer.
Dondequiera que estés, espero que estés bien.`,
  recuerdos: `Hay recuerdos que no piden regresar; solamente agradecen haber existido.
Gracias por haber sido una parte tan bonita de mi historia.
Algunos días se quedaron encendidos en la memoria.
Lo hermoso que compartimos puede descansar en paz.
Hay risas que dejan una luz suave en los años.
La memoria también sabe guardar sin retener.
Fuiste una estación luminosa en mi manera de mirar el mundo.
El pasado tiene flores que no hace falta arrancar.`,
  flores: `Solo quería que estas flores te recordaran que eres maravillosa.
Que nunca olvides la luz que llevas contigo.
Cada pétalo guarda un deseo sencillo: que estés bien.
Estas flores nacieron para acompañar un instante de tu día.
Incluso las flores necesitan recordar que fueron hechas para florecer.
Hay jardines que crecen en la parte tranquila del corazón.
Una flor amarilla puede ser una forma de decir: descansa.
Que la primavera encuentre sitio en tus ventanas.`,
  fuerza: `Que un día difícil no te haga olvidar quién eres.
Has llegado lejos, incluso cuando caminabas con miedo.
No tienes que poder con todo para ser valiente.
Tu delicadeza también es una forma de fuerza.
Ojalá reconozcas todo lo que has aprendido a sostener.
Puedes bajar la guardia y seguir siendo extraordinaria.
No hace falta brillar siempre para seguir siendo una estrella.
Hay una valentía silenciosa en volver a empezar.`,
  felicidad: `Siempre quise que fueras feliz, también en tus propios caminos.
Que la vida te encuentre sonriendo.
Ojalá tengas días que quieras recordar por su sencillez.
Te deseo risas que lleguen sin esfuerzo.
Que nunca falte una buena noticia junto a tu café.
Ojalá encuentres alegría en lugares inesperados.
Que tu felicidad se parezca cada vez más a ti.
Deseo que lo cotidiano te regale pequeñas celebraciones.`,
  amor: `Te amo de una manera que ya no necesita pedirte nada.
Hay amores que aprenden a vivir sin poseer.
Lo que sentí por ti no necesita una respuesta para haber sido verdadero.
Te quiero en esa parte tranquila del corazón donde solo hay gratitud.
Quererte también es respetar el horizonte que eliges.
Hay sentimientos que saben convertirse en buenos deseos.
El cariño verdadero también sabe quedarse en silencio.
Amar puede ser desearte una vida hermosa, libre y tuya.`,
  distancia: `Te sigo deseando cosas bonitas desde lejos.
Hay personas que no necesitan volver para seguir siendo importantes.
La distancia no le quita sinceridad a un buen deseo.
Quizá miremos cielos distintos; ojalá el tuyo esté lleno de luz.
Cada camino merece su propia primavera.
No hace falta estar cerca para desearte paz.
Dejo estas flores a la orilla de tu día, sin interrumpirlo.
Tu libertad también merece todos mis buenos deseos.`,
  promesa: `Si algún día necesitas un lugar donde dejar una palabra, sabrás dónde encontrarme.
Hay promesas que no necesitan repetirse para seguir siendo verdaderas.
Mientras pueda, siempre desearé que estés bien.
Si la noche se hace larga, alguien desea que amanezca bonito para ti.
Mi deseo de verte feliz nunca necesitó estar a tu lado.
Estas flores guardan una puerta abierta, sin pedir que la cruces.
Hay una escucha tranquila por si alguna vez la necesitas.
Algunas promesas se parecen a una lámpara que no exige visitas.`,
  admiración: `Ojalá pudieras verte con la ternura que mereces.
Tu manera de ser dejó belleza en este mundo.
Eres mucho más que aquello que hoy te preocupa.
Hay algo irrepetible en tu forma de iluminar los días.
No necesitas demostrar tu valor para tenerlo.
Tu sensibilidad merece un lugar donde sentirse segura.
Qué bonito que el universo haya encontrado tu forma de existir.
Nunca has necesitado ser perfecta para ser maravillosa.`,
  "días difíciles": `Si hoy estás triste, quédate un momento aquí.
No tienes que solucionar el mundo esta noche.
Respira. Mañana puede ser más amable.
Descansar también es avanzar.
Que hoy encuentres un rincón donde soltar el peso.
Tus días grises también merecen cuidado.
Ojalá estas palabras te acompañen sin hacer ruido.
No estás hecha solamente de tus días difíciles.`,
  futuro: `Espero que estés cumpliendo sueños que nunca llegué a conocer.
Que el camino que elijas esté lleno de luz.
Te deseo una vida donde el corazón se sienta en casa.
Que tus próximos capítulos tengan espacio para la calma.
Ojalá encuentres paisajes que te devuelvan el asombro.
Que lo que viene te permita ser cada vez más tú.
Hay días hermosos caminando hacia tu vida.
Que nunca te falten razones para comenzar algo bonito.`,
  gratitud: `Gracias por la luz que trajiste a mi historia.
Hay encuentros que nos enseñan a mirar con más ternura.
Guardo lo bonito con gratitud, sin pedirle que se repita.
Algunas personas se vuelven parte de nuestra forma de ver el mundo.
Lo compartido merece una despedida llena de cuidado.
Me alegra que nuestros caminos se hayan encontrado alguna vez.
Esta pequeña galaxia también sabe decir gracias.
Que nunca dejes de florecer.`,
};
const friendly = {
  felicidad: `Que nunca te falten motivos para sonreír.
Que la vida te sorprenda con cosas bonitas.
Ojalá hoy te encuentre una alegría pequeña.
Que tus días tengan más risas que prisas.
Hay felicidad escondida en las cosas sencillas.
Que un buen café y una buena noticia coincidan en tu mañana.
Celebra eso pequeño que hoy salió bien.
Tu sonrisa también cambia el paisaje.
Que lo cotidiano te regale un instante extraordinario.
Ojalá tengas tiempo para aquello que te hace bien.
Que la alegría encuentre siempre tu dirección.
Un día tranquilo también puede ser un gran día.
Guarda un espacio para las sorpresas bonitas.`,
  amistad: `Que encuentres personas que hagan tus días más ligeros.
La buena compañía también es una forma de hogar.
Que nunca te falte alguien con quien compartir una risa.
Hay amistades que son ventanas abiertas.
Un abrazo sincero puede cambiar una tarde.
Que tus alegrías siempre encuentren con quién celebrarse.
La vida florece mejor cuando compartimos el cuidado.
Ojalá te rodeen personas que te dejen ser tú.
Una conversación bonita puede encender el día.
Que tengas una mesa donde siempre haya sitio para ti.
Las mejores amistades respetan también el silencio.
Que la amabilidad te encuentre en cada camino.
Hoy es un buen día para agradecer una compañía.`,
  ánimo: `Hoy no necesitas tenerlo todo resuelto.
También está bien descansar.
Que nunca olvides lo mucho que vales.
Un paso pequeño sigue siendo un paso.
Puedes volver a intentarlo a tu ritmo.
No eres tus pendientes ni tus errores.
Respira: este momento no es toda tu historia.
Tienes permiso de cambiar de camino.
Tu esfuerzo cuenta aunque nadie lo vea.
La calma también ayuda a llegar lejos.
No compares tu primavera con la de nadie.
Haz espacio para tratarte con más ternura.
Incluso un día lento puede traer algo bueno.`,
  flores: `Esta pequeña galaxia florece para ti.
Que nunca te falten flores y razones para sonreír.
Cada flor amarilla es un deseo de días bonitos.
Hoy el universo tiene un pequeño jardín para ti.
Hay pétalos que parecen guardar un trocito de sol.
Que tus ventanas siempre encuentren primavera.
Una flor no tiene prisa por abrirse.
Hasta el jardín más pequeño cambia un paisaje.
Llévate un poco de amarillo para los días grises.
Estas flores celebran la suerte de que existas.
Que algo hermoso eche raíces en tu día.
Un pétalo puede recordarnos que la belleza sigue aquí.
Florecer también es aprender a recibir la luz.`,
  esperanza: `Que encuentres un poquito de luz en medio del caos.
Todavía hay buenas noticias por llegar.
Cada amanecer abre una posibilidad distinta.
No todos los caminos bonitos aparecen en los mapas.
Ojalá mañana te regale una razón nueva para confiar.
El cielo sigue ahí aunque hoy haya nubes.
Algo bueno puede comenzar con una decisión pequeña.
Que tus deseos encuentren terreno fértil.
Siempre puede abrirse una ventana inesperada.
Hay comienzos que llegan vestidos de calma.
Lo que hoy parece invierno también puede cambiar.
Que el futuro conserve su capacidad de sorprenderte.
Tus sueños merecen un lugar junto a la luz.`,
  crecimiento: `Que sigas creciendo incluso en los días difíciles.
Aprender también significa darte tiempo.
Cada intento deja una raíz nueva.
No necesitas ir rápido para ir lejos.
Cambiar de opinión puede ser una forma de crecer.
Tu camino no tiene que parecerse al de los demás.
Celebra la persona en la que te estás convirtiendo.
Lo que cuidas con paciencia aprende a florecer.
Hay aprendizajes que llegan cuando hacemos una pausa.
Que te atrevas a explorar lo que despierta tu curiosidad.
Puedes empezar de nuevo sin empezar desde cero.
Reconoce todo lo que ya has recorrido.
Crecer también es elegir qué dejar descansar.`,
  celebración: `Feliz Día de las Flores Amarillas.
Hoy celebramos las cosas que iluminan la vida.
Brindemos por los comienzos y por los pequeños logros.
Que este día tenga algo que quieras recordar.
Hay un cielo entero celebrando tu presencia.
Pon tu canción favorita y deja entrar la tarde.
Que una sorpresa amable te cambie los planes.
Lo sencillo también merece una celebración.
Hoy las estrellas tienen color de girasol.
Regálate un momento sin mirar el reloj.
Que nunca se pierda tu capacidad de asombro.
La vida también está hecha de instantes para disfrutar.
Este pequeño universo es una invitación a sonreír.`,
  "buenos deseos": `Que tengas paz al final del día.
Que no te falten salud, compañía y motivos para soñar.
Ojalá encuentres belleza en tu propio ritmo.
Que tus días tengan espacio para respirar.
Deseo que te pasen cosas que te hagan bien.
Que encuentres cuidado donde decidas quedarte.
Ojalá tus proyectos crezcan con alegría.
Que siempre haya una canción que te acompañe.
Que el mundo te trate con delicadeza.
Deseo que tus esfuerzos encuentren buenas oportunidades.
Que puedas mirar atrás con una sonrisa tranquila.
Ojalá lleves un poco de esta luz contigo.
Que nunca dejes de florecer a tu manera.`,
};
// Sorpresas íntimas, luminosas y juguetonas. Se activan al tocar flores en el modo especial.
const pinguinitaSurprises = [
  [
    "Pinguinita",
    "Para mi Pinguinita: una estrella acaba de hacer una reverencia solo para ti.",
  ],
  [
    "Corazón",
    "Para mi Corazón: encontré una flor que se parece mucho a tu manera de iluminar un día.",
  ],
  [
    "Comelona",
    "Para mi Comelona: el universo recomienda comer algo rico; hasta los planetas tienen hambre.",
  ],
  [
    "Mumilona",
    "Para mi Mumilona: dormir bonito también cuenta como una misión espacial cumplida.",
  ],
  [
    "Enojona",
    "Para mi Enojona: pausa cósmica, respiración profunda y una estrellita para que vuelva la sonrisa.",
  ],
  [
    "Reina",
    "Para mi Reina: hoy tienes primera fila frente a todos los girasoles del cielo.",
  ],
  [
    "BB",
    "Para mi BB: oficialmente declarada una maravilla de edición limitada.",
  ],
  [
    "Cachetonsita",
    "Para mi Cachetonsita: dos rayitos de sol, una flor y un abrazo tamaño galaxia.",
  ],
  [
    "Pinguinita adorable",
    "Para mi Pinguinita adorable y hermosa, la BB maravilla: esta flor se abrió de la emoción.",
  ],
  [
    "Bubucita",
    "Para mi Bubucita: abra cadabra… apareció una estrella con tu nombre escondido.",
  ],
  [
    "Pinguinita",
    "Si dices “shiii”, se enciende una estrella. La galaxia ya está esperando.",
  ],
  [
    "Corazón",
    "Una flor reporta que hoy tu sonrisa tiene permiso de ocupar todo el cielo.",
  ],
  [
    "Mumilona",
    "La constelación confirma que una llamada tranquila también puede ser un lugar bonito para descansar.",
  ],
  [
    "Comelona",
    "Alerta amarilla: esta galaxia detectó hambre. Procede a buscar algo delicioso.",
  ],
  [
    "Enojona",
    "Incluso las estrellas tienen días torcidos; por eso inventaron los abrazos y las pausas.",
  ],
  [
    "Reina",
    "Tu reino secreto acaba de ganar otra flor. El decreto oficial: hoy mereces cosas bonitas.",
  ],
  [
    "BB",
    "No cuenta como colgarse si el celular decidió apagarse solo. La galaxia lo verificó.",
  ],
  [
    "Bubucita",
    "Una flor pequeña preguntó por ti. Le dije que estabas ocupada siendo adorable.",
  ],
  [
    "Pinguinita",
    "El cielo guarda una risa de aquella vez en que todo terminó en un “jaja, ups”.",
  ],
  [
    "Corazón",
    "Hay recuerdos que hacen cosquillas en la memoria y se van dejando luz.",
  ],
  [
    "Pinguinita adorable",
    "Tu club oficial de admiradores tiene una sola integrante: esta galaxia completa.",
  ],
  [
    "Cachetonsita",
    "La luna mandó un mensaje: abrigadita, descansada y feliz, por favor.",
  ],
  [
    "Comelona",
    "Una estrella dijo que comer bien es una forma muy seria de cuidar el universo.",
  ],
  [
    "Mumilona",
    "La galaxia susurra: siesta aprobada. Repetimos: siesta completamente aprobada.",
  ],
  [
    "Enojona",
    "Esta flor no discute, no reclama y trae una misión: regalarte un minuto bonito.",
  ],
  [
    "Reina",
    "Si el día se pone raro, recuerda que todavía tienes una corona hecha de luz.",
  ],
  [
    "BB",
    "Una chispa acaba de votar por ti como la persona más maravillosa de esta órbita.",
  ],
  [
    "Bubucita",
    "Abra cadabra: una preocupación menos, una flor más y un poquito de magia para ti.",
  ],
  [
    "Pinguinita",
    "El universo no sabe cocinar, pero sí sabe servir flores con cariño.",
  ],
  [
    "Corazón",
    "Te encontré entre millones de estrellas porque algunas luces se reconocen.",
  ],
  [
    "Pinguinita adorable",
    "Una flor se abrió despacito para no interrumpir tu sonrisa.",
  ],
  [
    "Mumilona",
    "El mapa estelar marca un destino importante: la casita, una manta y mucha calma.",
  ],
  [
    "Comelona",
    "La galaxia acepta oficialmente la teoría de que un postre puede arreglar una tarde.",
  ],
  [
    "Enojona",
    "Tu enojo puede sentarse un rato; yo le dejo una flor y una taza de tranquilidad.",
  ],
  [
    "Reina",
    "El cielo acaba de iluminarse un poquito más porque llegaste hasta aquí.",
  ],
  [
    "Bubucita",
    "Esta flor tiene un secreto: eres más magia de la que te das cuenta.",
  ],
  [
    "BB",
    "Sonríe poquito. Una estrella acaba de tomar una foto mental de este momento bonito.",
  ],
];
const flatten = (groups) =>
  Object.entries(groups).flatMap(([category, lines]) =>
    lines.split("\n").map((text) => ({ category, text })),
  );
export const zorayaMessages = flatten(special);
export const friendshipMessages = flatten(friendly);
export const pinguinitaMessages = pinguinitaSurprises.map(
  ([category, text]) => ({ category, text }),
);
// Notas largas: aparecen al tocar una estrella de color.
export const supportNotes = [
  {
    title: "Cuando el cuerpo pide calma",
    text: "Si hoy el cuerpo te pide paciencia, dásela. La enfermedad también pasa, el descanso cuenta y un día más amable siempre puede llegar.",
  },
  {
    title: "Una pausa para respirar",
    text: "Los días de estrés son pasajeros. Respira despacio, resuelve una cosa a la vez y recuerda que no tienes que cargarlo todo al mismo tiempo.",
  },
  {
    title: "El camino que estás construyendo",
    text: "Sigue adelante con tus estudios a tu ritmo. Ya casi llega esa graduación que tanto has trabajado; cada página de tu tesis es una estrella más.",
  },
  {
    title: "Tus logros cuentan",
    text: "Yo siempre voy a celebrar tus logros, incluso los pequeños que nadie ve. Me alegra verte avanzar y me siento muy orgulloso de ti.",
  },
  {
    title: "Una mañana difícil no es todo el día",
    text: "Si una mañana empieza difícil, no significa que todo el día tenga que serlo. A veces basta una pausa, algo calientito y volver a intentarlo.",
  },
  {
    title: "Descansar también protege tus sueños",
    text: "Descansar no retrasa tus sueños; también los protege. Cierra los ojos un ratito, que el universo sabe esperar.",
  },
  {
    title: "Energía para seguir",
    text: "Primero algo rico, luego la tesis. El cerebro también necesita cariño, energía y quizá un pequeño premio por cada avance.",
  },
  {
    title: "Cuando una nube pasa por dentro",
    text: "Puedes tener un día torcido sin dejar de ser maravillosa. Deja que pase la nube; tu luz no desapareció, solo está descansando.",
  },
  {
    title: "Una luz para los días largos",
    text: "No estás sola en los días largos. Hay personas que creen en ti, una galaxia que te acompaña y un mañana que todavía guarda cosas bonitas.",
  },
  {
    title: "Mira todo lo que ya superaste",
    text: "Cuando dudes, mira todo lo que ya superaste. No llegaste hasta aquí por casualidad: tienes talento, ternura y una fuerza enorme.",
  },
  {
    title: "Un párrafo también es una victoria",
    text: "Tu tesis no tiene que nacer perfecta; solo necesita seguir avanzando contigo. Un párrafo hoy también es una victoria.",
  },
  {
    title: "Pedir apoyo también es valentía",
    text: "Si alguna vez te sientes cansada, escríbelo, respira y vuelve cuando puedas. Pedir apoyo también es una forma de valentía.",
  },
  {
    title: "El orgullo de verte avanzar",
    text: "Yo voy a mirar tus logros con orgullo, desde los primeros intentos hasta ese día en que cierres la tesis y digas: lo hice.",
  },
  {
    title: "Un paso pequeño sigue siendo progreso",
    text: "El futuro no exige que tengas todo claro hoy. Solo te pide un paso pequeño, y luego otro, con la calma de quien sí puede.",
  },
  {
    title: "Mañana vuelve a encenderse",
    text: "Una mala noche no puede borrar todo lo bueno que eres. Mañana volverá a encenderse despacito.",
  },
  {
    title: "Un rincón tranquilo para ti",
    text: "Si el mundo hace demasiado ruido, busca un rincón tranquilo. Tu paz también merece espacio entre las estrellas.",
  },
  {
    title: "La meta está más cerca",
    text: "La meta está cerca, aunque algunos días parezca esconderse. Termina a tu ritmo: cada avance merece una celebración pequeñita.",
  },
  {
    title: "Puedes sentir y volver a florecer",
    text: "No tienes que sonreír todo el tiempo para ser luz. También puedes sentir, parar y volver cuando el corazón esté listo.",
  },
  {
    title: "El día de tu graduación",
    text: "Cuando llegue la graduación, recuerda que no fue suerte: fueron tus desvelos, tu constancia y todas las veces que seguiste.",
  },
  {
    title: "Una certeza entre las estrellas",
    text: "Siempre voy a querer verte bien y siempre voy a sentir orgullo por tus pasos. No tienes que demostrarme nada: ya eres increíble.",
  },
  {
    title: "Las luces pequeñas también importan",
    text: "Si hoy solo pudiste avanzar un poquito, ese poquito también cuenta. Las galaxias se construyen con muchas luces pequeñas.",
  },
  {
    title: "Tu historia todavía tiene capítulos hermosos",
    text: "Que nadie te haga olvidar cuánto has trabajado. Tu historia está llena de intentos valientes y todavía tiene capítulos hermosos por escribir.",
  },
  {
    title: "Sanar puede ser algo sencillo",
    text: "A veces sanar es dormir, comer, tomar agua y dejar que alguien nos recuerde que mañana existe. Hazlo sin culpa.",
  },
  {
    title: "Tu propio ritmo también es válido",
    text: "No estás atrasada; estás recorriendo tu propio camino. Sigue, incluso lentamente: la dirección también es progreso.",
  },
  {
    title: "La primavera siempre encuentra una ventana",
    text: "Este pequeño universo guarda una certeza: los días difíciles no duran para siempre, pero tu capacidad de volver a florecer sí permanece.",
  },
  {
    title: "Cuando el cansancio visite",
    text: "No tienes que resolver el universo esta noche. Una respiración, un vaso de agua y un descanso también son pasos hacia adelante.",
  },
  {
    title: "Lo que nadie ve también cuenta",
    text: "Cada intento silencioso, cada página revisada y cada vez que vuelves a empezar está construyendo algo enorme. Yo también lo veo.",
  },
  {
    title: "Un día a la vez",
    text: "Hoy solo necesita ser hoy. Mañana tendrá su propio cielo y tú tendrás nuevas fuerzas para mirarlo.",
  },
  {
    title: "Tu voz merece descanso",
    text: "Si no encuentras las palabras para explicar cómo te sientes, no pasa nada. Puedes quedarte en silencio un rato; sigues estando acompañada.",
  },
  {
    title: "Antes de entregar la tesis",
    text: "Revisa una línea, celebra otra y recuerda por qué comenzaste. Tu esfuerzo ya convirtió una idea en un camino real.",
  },
  {
    title: "Cuando llegue la graduación",
    text: "Habrá una luz especial en ese día, pero la verdadera magia estuvo en todas las mañanas en que elegiste continuar.",
  },
  {
    title: "La luz vuelve despacio",
    text: "No necesita llegar de golpe. A veces aparece como una canción, una comida rica o una pequeña risa que se queda contigo.",
  },
  {
    title: "Tu esfuerzo tiene raíces",
    text: "Aunque todavía no veas todas las flores, debajo de la tierra ya está creciendo algo fuerte. Confía en tu proceso.",
  },
  {
    title: "Una pequeña celebración",
    text: "Por cada avance, por pequeño que parezca: aquí va una lluvia de estrellitas para recordarte que sí estás avanzando.",
  },
  {
    title: "No hace falta correr",
    text: "Tu camino no pierde valor por ir a otro ritmo. Sigue con suavidad; lo importante es que sigues siendo tú.",
  },
];
export class MessageBag {
  constructor(messages) {
    this.messages = messages;
    this.queue = [];
    this.last = null;
  }
  next(category) {
    if (!this.queue.length) {
      this.queue = [...this.messages];
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }
      if (this.queue.at(-1) === this.last) this.queue.reverse();
    }
    const index = category
      ? this.queue.findIndex((m) => m.category === category)
      : -1;
    this.last = index < 0 ? this.queue.pop() : this.queue.splice(index, 1)[0];
    return this.last;
  }
}
