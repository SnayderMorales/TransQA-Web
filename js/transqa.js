/*jshint esversion: 6 */

var TransQA = (function(){
  "use strict";

  var FILTRO_TIMESTAMP_INICIO_RECORRIDOS = 1525755600 * 1000; // 2018/05/08 05:00:00 UTC; 00:00:00 GMT-5
  var FILTRO_TIMESTAMP_FIN_RECORRIDOS = 1527829199 * 1000; // 2018/06/01 04:59:59 UTC; 2018/05/31 23:59:59 GMT-5
  var FILTRO_DISTANCIA_MINIMA_RECORRIDOS = 0.1; // 100 metros; 0.1 kilómetros
  var FILTRO_BLACKLIST_USUARIOS = [
    "fdpiniet@gmail.com",
    "miguetabaresl@gmail.com"
  ];
  var FILTRO_BLACKLIST_RECORRIDOS = [
    "-LC_-ioTL0YKEOh9Bsad",
    "-LC_ACkyc6UkVgO1Vkeb",
    "-LDC8oc9y-C0t4VkHuEm",
    "-LD78AIpG1E2OGklJvNR",
    "-LDBppwt7j8gjg6HUwN1",
    "-LD7Zg3ie9II_EDk5dIR",
    "-LDCthM2g4rErW24CJSG",
    "-LDCOXTuzC0cHqZKpmRH",
    "-LDEHrTWcaDTPzrfxKfx",
    "-LCjWmSZFIzf-X9EPHrf",
    "-LCi85HgoVkhZIO06zGc",
    "-LC4LBGuFdhz1s8HvekJ",
    "-LC4aLRhouaO3ZMS0hMR",
    "-LCeMjLTrb8p55WtJJHJ",
    "-LCeDQ_H_2u-3wf7KmJl",
    "-LDJ9konhNOPUyYwz-po",
    "-LDHGSiBKGwMyTw_7MJl",
    "-LD7riHeXVzeY5g2YLw3",
    "-LC4OmBwGbB8yAtOuSnR",
    "-LC4D4TvxN7QOA9sdVnc",
    "-LCAyw0nOUTDMSstKwR8",
    "-LCeVJzxmgHPF4QaYR7i",
    "-LC-V5tbg62qzIXz6SMn",
    "-LDHUPRJT5_gQwA-m0DV",
    "-LC_uuRZarGt0JGZU3BX",
    "-LChp0NknMSH9u_ggwQa",
    "-LCjzYy3LQChTL8GznP0",
    "-LCjTc3VaSIP6tHD3Pip",
    "-LCjdqO0f_3xC50l4GWq",
    "-LC_OmUy7ywsr8aCyoLZ",
    "-LDmwUHOoY6DCe2TwBkh",
    "-LDfcr-jh1JctWXzsFyZ",
    "-LDg3idfHbou0-gcYCx6",
    "-LDg2w0sgQIQwq_YGhDk",
    "-LDhpHiyyZ0shccyOIPe",
    "-LDr_v9EpK6WOgFJrZtY",
    "-LCinx8V74iFR0Lfi2RG",
    "-LD81UWRg0b9P1EeIxEz",
    "-LDmUXoFjQxc6OrYihqn",
    "-LDmOsKmFNxc5Mi3VAVh",
    "-LD7CpQGS-oX5c8nHYYp",
    "-LDms5fe-qdxAR3vT7Rr",
    "-LDqFdaXoByTMMz7_wib"
  ];
  var FILTRO_WHITELIST_DIAS_DE_SEMANA = [
    //0,  // Domingo
    //1,  // Lunes
    2,    // Martes
    3,    // Miércoles
    4,    // Jueves
    //5,  // Viernes
    //6   // Sábado
  ];

  var ZOOM_MAPA = 13;
  var CENTRO_MAPA = {
    lat: 10.41,
    lng: -75.505
  };

  var MILLA_INTERNACIONAL = 1.609344; // En kilómetros

  var PUNTO_REFERENCIA_SOLO_CARRIL_1 = new google.maps.LatLng(10.42033,-75.55108); // Centro, Bodeguita
  var PUNTO_REFERENCIA_SOLO_CARRIL_2 = new google.maps.LatLng(10.397383,-75.472797); // Salida de estación Transcaribe
  var DISTANCIA_COMPARACION_PUNTO_REFERENCIA = 50; // Metros

  var COLORES = [
    "#00AAAA",
    "#AA0000",
    "#00AA00",
    "#0000AA",
    "#AAAA00",
    "#AA00AA",
    "#8a31ec",
    "#8fa81c",
    "#e13094",
    "#ac92c5",
    "#af769b",
    "#c2fe7a",
    "#437af9",
    "#7b5f88",
    "#7de991",
    "#f35367",
    "#b0e02c",
    "#871657",
    "#cf0130",
    "#2e5a63",
    "#f2b465"
  ];

  var elementoMapa = document.getElementById("mapa");

  var elementoUsuariosTitulo = document.getElementById("usuarios-titulo");
  var elementoRutasTitulo = document.getElementById("rutas-titulo");
  var elementoTodoTitulo = document.getElementById("todo-titulo");

  var elementoTodo = document.getElementById("todo");
  var elementoUsuarios = document.getElementById("usuarios-list");
  var elementoRutas = document.getElementById("rutas");
  var elementoRecorridos = document.getElementById("recorridos");

  var elementoNada = document.getElementById("nada");

  var elementoTituloDetalles = document.getElementById("detalles-titulo");
  var elementoDetalles = document.getElementById("detalles");

  var mapa;

  var marcadores;
  var polylines;

  var csv;
  var csvRutas;
  var datos;

  var rellenarEnteroConCeros = function(entero, lugaresDecimales) {
    let enteroString = String(entero);

    while (enteroString.length < lugaresDecimales) {
      enteroString = '0' + enteroString;
    }

    return enteroString;
  };

  var fechaAString = function(fecha) {
    //return fecha.toISOString().replace(/(.*)T(.*)\..*/, '$1 $2');
	  return `${ rellenarEnteroConCeros(fecha.getFullYear(), 4) }-${ rellenarEnteroConCeros(fecha.getMonth() + 1, 2) }-${ rellenarEnteroConCeros(fecha.getDate(), 2) } ${ rellenarEnteroConCeros(fecha.getHours(), 2) }:${ rellenarEnteroConCeros(fecha.getMinutes(), 2) }:${ rellenarEnteroConCeros(fecha.getSeconds(), 2) }`;
  };

  var floatAString = function(valor, lugaresDecimales) {
    // Redondea al convertir float a string.
    // https://stackoverflow.com/a/32178833
    return Number(Math.round(valor+'e2')+'e-2').toFixed(lugaresDecimales);
  };

  var convertirCoordenadasACoordenadasGoogleMaps = function(coordenadasTransQA) {
    var coordenadas = [];
    var i;

    for (i in coordenadasTransQA) {
      coordenadas.push({
        lat: coordenadasTransQA[i].latitud,
        lng: coordenadasTransQA[i].longitud
      });
    }

    return coordenadas;
  };

  var mostrarRecorrido = function(id, limpiarMapa, color) {
    var recorrido = datos.recorridos[id];
    var coordenadas;
    var polyline;

    var stringMarcadores;

    if (limpiarMapa) {
      vaciarMapa();
    }

    if ((typeof color === "undefined") || color == null) {
      color = COLORES[0];
    }

    coordenadas = convertirCoordenadasACoordenadasGoogleMaps(recorrido.puntos);

    polyline = new google.maps.Polyline({
      path: coordenadas,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    polylines.push(polyline);
    polyline.setMap(mapa);

    stringMarcadores =
    '-- Email: ' + recorrido.email + '\n' +
    '-- Usuario: ' + recorrido.usuario.id + '\n' +
    '-- ID de Recorrido: ' + recorrido.id + '\n' +
    '-- Ruta: ' + recorrido.vehiculo + '\n' +
    '-- Datos de primera y última milla: ' + ((recorrido.primeraMilla != null && recorrido.ultimaMilla != null) ? 'Disponible' : 'No disponible') + '\n' +
    '-- Datos dentro de solo carril: ' + (recorrido.soloCarril != null ? 'Disponible' : 'No disponible') + '\n' +
    '-- Velocidad: ' + floatAString(recorrido.velocidadMedia, 3) + ' km/h\n' +
    '-- Distancia recorrida: ' + floatAString(recorrido.distanciaRecorrida, 3) + 'km\n' +
    '-- Desplazamiento: ' + floatAString(recorrido.desplazamiento, 3) + 'km\n' +
    '-- Número de puntos capturados: ' + recorrido.puntos.length + '\n' +
    '-- Duración: ' + rellenarEnteroConCeros(recorrido.duracion.horas, 2) + ' horas, ' + rellenarEnteroConCeros(recorrido.duracion.minutos, 2) + ' minutos, ' + rellenarEnteroConCeros(recorrido.duracion.segundos, 2) + ' segundos\n' +
    '-- Fecha inicio: ' + fechaAString(recorrido.fechaInicio) + '\n' +
    '-- Fecha fin: ' + fechaAString(recorrido.fechaFin);

    marcadores.push(new google.maps.Marker({
      position: coordenadas[coordenadas.length - 1],
      map: mapa,
      title: "FIN:\n" + stringMarcadores
    }));

    marcadores.push(new google.maps.Marker({
      position: coordenadas[0],
      map: mapa,
      title: "INICIO:\n" + stringMarcadores
    }));

    // https://stackoverflow.com/a/5113169
    google.maps.event.addListener(polyline, 'mouseover', function() {
      window.console.log("RECORRIDO:\n" + stringMarcadores);
    });

    google.maps.event.addListener(polyline, 'mouseout', function() {
        // No usado.
    });
  };

  var mostrarUsuario = function(id) {
    var color = 0;
    var i;

    vaciarMapa();

    for (i in datos.usuarios[id].recorridos) {
      mostrarRecorrido(i, false, COLORES[color]);
      color = (color + 1) % COLORES.length;
    }
  };

  var mostrarRuta = function(id) {
    var color = 0;
    var i;

    vaciarMapa();

    for (i in datos.rutas[id].recorridos) {
      mostrarRecorrido(i, false, COLORES[color]);
      color = (color + 1) % COLORES.length;
    }
  };

  var mostrarTodo = function() {
    var color = 0;
    var i;

    vaciarMapa();

    for (i in datos.recorridos) {
      mostrarRecorrido(i, false, COLORES[color]);
      color = (color + 1) % COLORES.length;
    }
  };

  var crearMapa = function() {
    marcadores = [];
    polylines = [];

    mapa = new google.maps.Map(elementoMapa, {
      zoom: ZOOM_MAPA,
      center: CENTRO_MAPA
    });
  };

  var vaciarMapa = function() {
    var i;

    mapa.setZoom(ZOOM_MAPA);
    mapa.setCenter(CENTRO_MAPA);

    for (i in marcadores) {
      marcadores[i].setMap(null);
    }

    for (i in polylines) {
      polylines[i].setMap(null);
    }

    marcadores = [];
    polylines = [];
  };

  var migrarRutasAnteriores = function() {
    var i;

    for (i in datos.rutas) {
      switch (i) {
        case "0":
          datos.rutas[i].nombre = "Ruta desconocida (error)";
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
          datos.rutas[i].nombre = 'Vehículo "' + i + '" (datos viejos)';
          break;
        case "1001":
          datos.rutas[i].nombre = "A113p: Pozón (datos viejos)";
          break;
        case "1002":
          datos.rutas[i].nombre = "A113: Pozón (datos viejos)";
          break;
        case "1003":
          datos.rutas[i].nombre = "T103: Bocagrande (datos viejos)";
          break;
        case "1004":
          datos.rutas[i].nombre = "T102: Crespo (datos viejos)";
          break;
        case "1005":
          datos.rutas[i].nombre = "T101: Portal (datos viejos)";
          break;
        case "1006":
          datos.rutas[i].nombre = "X106: Variante (datos viejos)";
          break;
      }
    }
  };

  var diferenciaTimestamps = function(timestampInicio, timestampFin) {
    var d = timestampFin - timestampInicio;

    var h = Math.floor(d / 3600000);
    var m = Math.floor(d % 3600000 / 60000);
    var s = Math.floor(d % 3600000 % 60000 / 1000);

    return {
      "horas": h,
      "minutos": m,
      "segundos": s
    };
  };

  var analizarRecorrido = function(recorrido, recorridoJSON, idUsuario, idRecorrido) {
    // Los IDs de usuario y recorrido están aquí sólo por depuración actualmente

    // Aquí distanciaTotal es usado por verificación;
    // (distanciaTroncal + distanciaAlimentadora) debe igualar a distanciaTotal
    // o debe estar suficientemente cerca (son floats/doubles!)
    var distanciaTotal = 0;
    var distanciaTroncal = 0;
    var distanciaAlimentadora = 0;
    var distanciaPrimeraMilla = 0;
    var distanciaUltimaMilla = 0;

    var duracionTotal;
    var duracionTroncal;
    var duracionAlimentadora;
    var duracionPrimeraMilla;
    var duracionUltimaMilla;

    var desplazamientoTotal;
    var desplazamientoTroncal;

    var velocidadMedia;
    var velocidadMediaTroncal;
    var velocidadMediaAlimentadora;
    var velocidadMediaPrimeraMilla;
    var velocidadMediaUltimaMilla;

    var puntoInicial;
    var puntoA = null;
    var puntoAIndice;
    var puntoB = null;
    var puntoBIndice;
    var puntoFinal;
    var puntoDeReferenciaMasCercano = null;
    var puntoDeReferenciaMasDistante = null;
    var puntoDeReferenciaMasCercanoIndice;
    var puntoDeReferenciaMasDistanteIndice;
    var puntoActual;
    var puntoSiguiente;

    var soloCarril = null;
    var primeraMilla = null;
    var ultimaMilla = null;

    var distanciaActual;
    var i;

    // Primer pasado: encontrar los puntos de referencia más cercanos y más lejanos.
    for (i = 0; i < recorridoJSON.puntos.length - 1; i++) {
      puntoActual = new google.maps.LatLng(recorridoJSON.puntos[i].latitud, recorridoJSON.puntos[i].longitud);
      puntoSiguiente = new google.maps.LatLng(recorridoJSON.puntos[i + 1].latitud, recorridoJSON.puntos[i + 1].longitud);

      if (puntoA == null) {
        if (google.maps.geometry.spherical.computeDistanceBetween(puntoActual, PUNTO_REFERENCIA_SOLO_CARRIL_1) < DISTANCIA_COMPARACION_PUNTO_REFERENCIA) {
          puntoA = puntoActual;
          puntoAIndice = i;
        } else if (google.maps.geometry.spherical.computeDistanceBetween(puntoSiguiente, PUNTO_REFERENCIA_SOLO_CARRIL_1) < DISTANCIA_COMPARACION_PUNTO_REFERENCIA) {
          puntoA = puntoSiguiente;
          puntoAIndice = i + 1;
        }

        if (puntoA != null) {
          if (puntoDeReferenciaMasCercano == null) {
            puntoDeReferenciaMasCercano = puntoA;
            puntoDeReferenciaMasCercanoIndice = puntoAIndice;
          } else {
            puntoDeReferenciaMasDistante = puntoA;
            puntoDeReferenciaMasDistanteIndice = puntoAIndice;
          }
        }
      }

      if (puntoB == null) {
        if (google.maps.geometry.spherical.computeDistanceBetween(puntoActual, PUNTO_REFERENCIA_SOLO_CARRIL_2) < DISTANCIA_COMPARACION_PUNTO_REFERENCIA) {
          puntoB = puntoActual;
          puntoBIndice = i;
        } else if (google.maps.geometry.spherical.computeDistanceBetween(puntoSiguiente, PUNTO_REFERENCIA_SOLO_CARRIL_2) < DISTANCIA_COMPARACION_PUNTO_REFERENCIA) {
          puntoB = puntoSiguiente;
          puntoBIndice = i + 1;
        }

        if (puntoB != null) {
          if (puntoDeReferenciaMasCercano == null) {
            puntoDeReferenciaMasCercano = puntoB;
            puntoDeReferenciaMasCercanoIndice = puntoBIndice;
          } else {
            puntoDeReferenciaMasDistante = puntoB;
            puntoDeReferenciaMasDistanteIndice = puntoBIndice;
          }
        }
      }
    }

    // Si se encontraron datos de solo carril, se crea un objeto en blanco para contener dichos datos
    // Si no, continúa siendo null.
    if (puntoDeReferenciaMasCercano != null && puntoDeReferenciaMasDistante != null) {
      soloCarril = {};
    }

    // Si no, se calculan los datos restantes
    for (i = 0; i < recorridoJSON.puntos.length - 1; i++) {
      puntoActual = new google.maps.LatLng(recorridoJSON.puntos[i].latitud, recorridoJSON.puntos[i].longitud);
      puntoSiguiente = new google.maps.LatLng(recorridoJSON.puntos[i + 1].latitud, recorridoJSON.puntos[i + 1].longitud);
      distanciaActual = google.maps.geometry.spherical.computeDistanceBetween(puntoActual, puntoSiguiente);

      distanciaTotal += distanciaActual;

      // Se multiplica milla por 1000 porque en este instante las distancias
      // que provienen de los datos JSON están todas en metros, no kilómetros
      if (distanciaPrimeraMilla < MILLA_INTERNACIONAL * 1000) {
        distanciaPrimeraMilla += distanciaActual;

        if (distanciaPrimeraMilla >= MILLA_INTERNACIONAL * 1000) {
          duracionPrimeraMilla = duracionPrimeraMilla = recorridoJSON.puntos[i + 1].fecha - recorridoJSON.puntos[0].fecha;
        }
      }

      if (soloCarril != null) {
        if (i >= puntoDeReferenciaMasCercanoIndice && (i + 1) <= puntoDeReferenciaMasDistanteIndice) {
          distanciaTroncal += distanciaActual;
        } else if ((i < puntoDeReferenciaMasCercanoIndice && (i + 1) <= puntoDeReferenciaMasCercanoIndice) || (i >= puntoDeReferenciaMasDistanteIndice && i + 1 > puntoDeReferenciaMasDistanteIndice)) {
          distanciaAlimentadora += distanciaActual;
        }
      }
    }

    // Se computa la última milla
    for (i = recorridoJSON.puntos.length - 1; i > 0; i--) {
      puntoActual = new google.maps.LatLng(recorridoJSON.puntos[i].latitud, recorridoJSON.puntos[i].longitud);
      puntoSiguiente = new google.maps.LatLng(recorridoJSON.puntos[i - 1].latitud, recorridoJSON.puntos[i - 1].longitud);
      distanciaActual = google.maps.geometry.spherical.computeDistanceBetween(puntoActual, puntoSiguiente);

      distanciaUltimaMilla += distanciaActual;

      if (distanciaUltimaMilla >= MILLA_INTERNACIONAL * 1000) {
        duracionUltimaMilla = recorridoJSON.puntos[recorridoJSON.puntos.length - 1].fecha - recorridoJSON.puntos[i - 1].fecha;

        break;
      }
    }

    puntoInicial = new google.maps.LatLng(recorridoJSON.puntos[0].latitud, recorridoJSON.puntos[0].longitud);
    puntoFinal = new google.maps.LatLng(recorridoJSON.puntos[recorridoJSON.puntos.length - 1].latitud, recorridoJSON.puntos[recorridoJSON.puntos.length - 1].longitud);

    distanciaTotal /= 1000;
    desplazamientoTotal = google.maps.geometry.spherical.computeDistanceBetween(puntoInicial, puntoFinal) / 1000;
    duracionTotal = recorridoJSON.puntos[recorridoJSON.puntos.length - 1].fecha - recorridoJSON.puntos[0].fecha;
    velocidadMedia = distanciaTotal / (duracionTotal / 3600000);

    // Preparando datos de primera y última milla en caso de estar disponibles
    distanciaPrimeraMilla /= 1000;
    if (distanciaPrimeraMilla >= MILLA_INTERNACIONAL) {
      velocidadMediaPrimeraMilla = distanciaPrimeraMilla / (duracionPrimeraMilla / 3600000);

      primeraMilla = {
        duracion: diferenciaTimestamps(0, duracionPrimeraMilla),
        distancia: distanciaPrimeraMilla,
        velocidadMedia: velocidadMediaPrimeraMilla,

        // Se mantiene la duración original para depuración
        _duracion: duracionPrimeraMilla
      };
    }

    distanciaUltimaMilla /= 1000;
    if (distanciaUltimaMilla >= MILLA_INTERNACIONAL) {
      velocidadMediaUltimaMilla = distanciaUltimaMilla / (duracionUltimaMilla / 3600000);

      ultimaMilla = {
        duracion: diferenciaTimestamps(0, duracionUltimaMilla),
        distancia: distanciaUltimaMilla,
        velocidadMedia: velocidadMediaUltimaMilla,

        // Se mantiene la duración original para depuración
        _duracion: duracionUltimaMilla
      };
    }

    // Se preparan datos de solo carril si están disponibles
    if (soloCarril != null) {
      distanciaTroncal /= 1000;
      distanciaAlimentadora /= 1000;

      desplazamientoTroncal = google.maps.geometry.spherical.computeDistanceBetween(puntoDeReferenciaMasCercano, puntoDeReferenciaMasDistante) / 1000;

      duracionTroncal = recorridoJSON.puntos[puntoDeReferenciaMasDistanteIndice].fecha - recorridoJSON.puntos[puntoDeReferenciaMasCercanoIndice].fecha;
      duracionAlimentadora = duracionTotal - duracionTroncal;

      velocidadMediaTroncal = distanciaTroncal / (duracionTroncal / 3600000);
      velocidadMediaAlimentadora = distanciaAlimentadora / (duracionAlimentadora / 3600000);

      soloCarril.duracion = diferenciaTimestamps(0, duracionTroncal);
      soloCarril.desplazamiento = desplazamientoTroncal;
      soloCarril.distanciaRecorrida = distanciaTroncal;
      soloCarril.velocidadMedia = velocidadMediaTroncal;

      // Se mantienen estos datos por depuración
      soloCarril._duracion = duracionTroncal;
      soloCarril._entrada = recorridoJSON.puntos[puntoDeReferenciaMasCercanoIndice].fecha;
      soloCarril._salida = recorridoJSON.puntos[puntoDeReferenciaMasDistanteIndice].fecha;

      // Datos fuera de la troncal
      soloCarril.duracionAlimentadora = diferenciaTimestamps(0, duracionAlimentadora);
      soloCarril.distanciaRecorridaAlimentadora = distanciaAlimentadora;
      soloCarril.velocidadMediaAlimentadora = velocidadMediaAlimentadora;

      // Depuración
      soloCarril._duracionAlimentadora = duracionAlimentadora;
    }

    // Se escriben todos los datos en el objeto recorrido, incluyendo soloCarril
    recorrido.desplazamiento = desplazamientoTotal;
    recorrido.distanciaRecorrida = distanciaTotal;
    recorrido.velocidadMedia = velocidadMedia;

    recorrido._fechaInicio = recorridoJSON.puntos[0].fecha;
    recorrido.fechaInicio = new Date(recorrido._fechaInicio);

    recorrido._fechaFin = recorridoJSON.puntos[recorridoJSON.puntos.length - 1].fecha;
    recorrido.fechaFin = new Date(recorrido._fechaFin);

    recorrido.duracion = diferenciaTimestamps(recorrido._fechaInicio, recorrido._fechaFin);
    recorrido._duracion = recorrido._fechaFin - recorrido._fechaInicio;

    recorrido.primeraMilla = primeraMilla;
    recorrido.ultimaMilla = ultimaMilla;

    recorrido.soloCarril = soloCarril;
  };

  var filtrarRecorrido = function(idRecorrido, recorridoJSON) {
    var tempFecha;

    if (recorridoJSON.puntos === undefined || recorridoJSON.puntos.length == 0) {
      // Ignorando recorrido sin puntos.
      return false;
    } else if (parseFloat(recorridoJSON.distanciaRecorrida) < FILTRO_DISTANCIA_MINIMA_RECORRIDOS) {
      // Ignorando recorridos que no excedan la distancia recorrida mínima.
      return false;
    } else if (recorridoJSON.fechaInicio > recorridoJSON.fechaFin) {
      // Ignorando recorridos con fecha de inicio superior a fecha final.
      return false;
    } else if (recorridoJSON.fechaInicio == undefined || parseInt(recorridoJSON.fechaInicio) < FILTRO_TIMESTAMP_INICIO_RECORRIDOS) {
      // Ignorando recorrido antes de TIMESTAMP_INICIO_RECORRIDOS.
      return false;
    } else if (parseInt(recorridoJSON.fechaInicio) >= FILTRO_TIMESTAMP_FIN_RECORRIDOS) {
      // Ignorando recorridos después de FILTRO_TIMESTAMP_FIN_RECORRIDOS
      return false;
    } else if (FILTRO_BLACKLIST_USUARIOS.indexOf(recorridoJSON.email) >= 0) {
      // Ignorano recorridos de usuarios que figuran en el blacklist.
      return false;
    } else if (FILTRO_WHITELIST_DIAS_DE_SEMANA.indexOf((tempFecha = new Date(recorridoJSON.fechaInicio)).getDay()) == -1) {
      // Ignorando recorridos en días de semana que no estén en el whitelist.
      return false;
    } else if (FILTRO_BLACKLIST_RECORRIDOS.indexOf(idRecorrido) >= 0) {
      // Ignorando recorridos en blacklist de recorridos individuales
      return false;
    }

    // Recorrido pasa todos los filtros anteriores.
    return true;
  };

  var leerDatos = function() {
    var j; // ID usuario de Google. _JSON[j] = Listado de recorridos de usuario.
    var k; // ID de recorrido. _JSON[j][k] = Recorrido individual de un usuario.
    var l; // Índice de coordenada. _JSON[j][k].puntos[l] es una coordenada.

    var t; // Temporalmente usado para totales.
    var v; // Temporal, para velocidades.

    var usuario;
    var recorrido;
    var ruta;
    var datosTroncal;
    var datosPrimeraUltimaMilla;

    csv = "";
    csvRutas = "";

    var _csv = []; // Temporal. Usados para filtrar y luego convertir datos.
    var _csvRutas = [];

    var filaCSVRutas;

    datos = {
      usuarios: {},
      recorridos: {},
      rutas: {}
    };

    for (j in _JSON) {
      if (_JSON.hasOwnProperty(j)) {
        for (k in _JSON[j]) {
          if (_JSON[j].hasOwnProperty(k)) {
            if (!filtrarRecorrido(k, _JSON[j][k])) {
              // Se ignora todo recorrido que no pase el filtro de recorridos.
              continue;
            }

            if (!datos.usuarios.hasOwnProperty(j)) {
              // Se agrega el usuario de este recorrido al listado de usuarios.
              // Todo usuario sin recorridos no figurará en los listados.
              usuario = {
                "id": j,
                "email": _JSON[j][k].email,
                "recorridos": {}
              };

              datos.usuarios[j] = usuario;
            } else {
              // Se obtiene referencia al nodo del usuario de recorrido actual.
              usuario = datos.usuarios[j];
            }

            // Se obtiene una referencia a la ruta de este recorrido, si existe.
            // Si no existe, es creada y agregada al listado de rutas.
            if (!datos.rutas.hasOwnProperty(_JSON[j][k].vehiculo)) {
              ruta = {
                nombre: _JSON[j][k].vehiculo, // Se hacen correcciones luego
                recorridos: {},
                velocidadMedia: 0,

                primeraMilla: {
                  recorridos: {},
                  duracionMedia: {
                    horas: 0,
                    minutos: 0,
                    segundos: 0
                  },
                  distanciaMedia: 0,
                  velocidadMedia: 0,

                  _duracionMedia: 0
                },

                ultimaMilla: {
                  recorridos: {},
                  duracionMedia: {
                    horas: 0,
                    minutos: 0,
                    segundos: 0
                  },
                  distanciaMedia: 0,
                  velocidadMedia: 0,

                  _duracionMedia: 0
                },

                soloCarril: {
                  recorridos: {},
                  duracionMediaTotal: {
                    horas: 0,
                    minutos: 0,
                    segundos: 0
                  },
                  duracionMediaTroncal: {
                    horas: 0,
                    minutos: 0,
                    segundos: 0
                  },
                  duracionMediaAlimentadora: {
                    horas: 0,
                    minutos: 0,
                    segundos: 0
                  },
                  desplazamientoMedioTotal: 0,
                  desplazamientoMedioTroncal: 0,
                  distanciaMediaTotal: 0,
                  distanciaMediaTroncal: 0,
                  distanciaMediaAlimentadora: 0,
                  velocidadMediaTotal: 0,
                  velocidadMediaTroncal: 0,
                  velocidadMediaAlimentadora: 0,

                  _duracionMediaTotal: 0,
                  _duracionMediaTroncal: 0,
                  _duracionMediaAlimentadora: 0
                }
              };

              datos.rutas[_JSON[j][k].vehiculo] = ruta;
            } else {
              ruta = datos.rutas[_JSON[j][k].vehiculo];
            }

            // Se prepara un objeto recorrido enlazado a su usuario y ruta.
            // Se toma como base todo dato que proviene del _JSON. Algunos
            // valores son sobreescritos para mejor presentación de los datos.
            // Otras nuevas propiedades son computadas y agregadas para
            // facilitar el uso de la información. Las fechas son convertidas a
            // objetos Date en timezone local, incluyendo las fechas de cada
            // coordenada. Por último, la propiedad "duracion" añadida.
            recorrido = _JSON[j][k];

            recorrido.id = k;
            recorrido.usuario = usuario;
            recorrido.ruta = ruta;

            analizarRecorrido(recorrido, _JSON[j][k], _JSON[j][k].email, k);

            for (l in _JSON[j][k].puntos) {
              _JSON[j][k].puntos[l].fecha = new Date(_JSON[j][k].puntos[l].fecha);
            }

            // Se agrega el nuevo recorrido al listado de recorridos, y se
            // guardan referencias al mismo bajo los objetos usuario y ruta
            // correspondientes.
            datos.recorridos[k] = recorrido;

            usuario.recorridos[k] = recorrido;
            ruta.recorridos[k] = recorrido;

            // Se agregan datos de primera y última milla a ruta, si los hay
            if (recorrido.primeraMilla != null && recorrido.ultimaMilla != null) {
              ruta.primeraMilla.recorridos[k] = recorrido;

              ruta.ultimaMilla.recorridos[k] = recorrido;

              ruta.primeraMilla._duracionMedia += recorrido.primeraMilla._duracion;
              ruta.primeraMilla._duracionMedia += recorrido.primeraMilla._duracion;
              ruta.primeraMilla.distanciaMedia += recorrido.primeraMilla.distancia;
              ruta.primeraMilla.velocidadMedia += recorrido.primeraMilla.velocidadMedia;

              ruta.ultimaMilla._duracionMedia += recorrido.ultimaMilla._duracion;
              ruta.ultimaMilla._duracionMedia += recorrido.ultimaMilla._duracion;
              ruta.ultimaMilla.distanciaMedia += recorrido.ultimaMilla.distancia;
              ruta.ultimaMilla.velocidadMedia += recorrido.ultimaMilla.velocidadMedia;
            }

            // En caso de existir, se agregan los datos de solo carril a la ruta
            if (recorrido.soloCarril != null) {
              ruta.soloCarril.recorridos[k] = recorrido;

              ruta.soloCarril._duracionMediaTotal += recorrido._duracion;
              ruta.soloCarril._duracionMediaTroncal += recorrido.soloCarril._duracion;
              ruta.soloCarril._duracionMediaAlimentadora += recorrido.soloCarril._duracionAlimentadora;
              ruta.soloCarril.desplazamientoMedioTotal += recorrido.desplazamiento;
              ruta.soloCarril.desplazamientoMedioTroncal += recorrido.soloCarril.desplazamiento;
              ruta.soloCarril.distanciaMediaTotal += recorrido.distanciaRecorrida;
              ruta.soloCarril.distanciaMediaTroncal += recorrido.soloCarril.distanciaRecorrida;
              ruta.soloCarril.distanciaMediaAlimentadora += recorrido.soloCarril.distanciaRecorridaAlimentadora;
              ruta.soloCarril.velocidadMediaTotal += recorrido.velocidadMedia;
              ruta.soloCarril.velocidadMediaTroncal += recorrido.soloCarril.velocidadMedia;
              ruta.soloCarril.velocidadMediaAlimentadora += recorrido.soloCarril.velocidadMediaAlimentadora;
            }
          }
        }
      }
    }

    // Se calcula la velocidad media total de la ruta, así como los promedios de
    // troncal y mixtos, primera y última milla por cada ruta, si aplican.
    for (j in datos.rutas) {
      v = 0;

      for (k in datos.rutas[j].recorridos) {
        v += datos.rutas[j].recorridos[k].velocidadMedia;
      }

      datos.rutas[j].velocidadMedia = v / Object.keys(datos.rutas[j].recorridos).length;

      if ((t = Object.keys(datos.rutas[j].primeraMilla.recorridos).length) > 0) {
        datos.rutas[j].primeraMilla._duracionMedia /= t;
        datos.rutas[j].primeraMilla.distanciaMedia /= t;
        datos.rutas[j].primeraMilla.velocidadMedia /= t;

        datos.rutas[j].ultimaMilla._duracionMedia /= t;
        datos.rutas[j].ultimaMilla.distanciaMedia /= t;
        datos.rutas[j].ultimaMilla.velocidadMedia /= t;

        datos.rutas[j].primeraMilla.duracionMedia = diferenciaTimestamps(0, datos.rutas[j].primeraMilla._duracionMedia);
        datos.rutas[j].ultimaMilla.duracionMedia = diferenciaTimestamps(0, datos.rutas[j].ultimaMilla._duracionMedia);
      }

      if ((t = Object.keys(datos.rutas[j].soloCarril.recorridos).length) > 0) {
        datos.rutas[j].soloCarril._duracionMediaTotal /= t;
        datos.rutas[j].soloCarril._duracionMediaTroncal /= t;
        datos.rutas[j].soloCarril._duracionMediaAlimentadora /= t;
        datos.rutas[j].soloCarril.desplazamientoMedioTotal /= t;
        datos.rutas[j].soloCarril.desplazamientoMedioTroncal /= t;
        datos.rutas[j].soloCarril.distanciaMediaTotal /= t;
        datos.rutas[j].soloCarril.distanciaMediaTroncal /= t;
        datos.rutas[j].soloCarril.distanciaMediaAlimentadora /= t;
        datos.rutas[j].soloCarril.velocidadMediaTotal /= t;
        datos.rutas[j].soloCarril.velocidadMediaTroncal /= t;
        datos.rutas[j].soloCarril.velocidadMediaAlimentadora /= t;

        datos.rutas[j].soloCarril.duracionMediaTotal = diferenciaTimestamps(0, datos.rutas[j].soloCarril._duracionMediaTotal);
        datos.rutas[j].soloCarril.duracionMediaTroncal = diferenciaTimestamps(0, datos.rutas[j].soloCarril._duracionMediaTroncal);
        datos.rutas[j].soloCarril.duracionMediaAlimentadora = diferenciaTimestamps(0, datos.rutas[j].soloCarril._duracionMediaAlimentadora);
      }
    }

    // Para las rutas que usan nombres anteriores (usualmente números enteros,
    // no nombres completos de rutas) se aplican correcciones. Sus keys serán
    // mantenidas, pero sus propiedades "nombre" reflejaran a nombres más
    // recientes. Para presentar información de rutas, si el nombre del key
    // de la ruta no coincide con su valor nombre, entonces se debe preferir
    // mostrar el valor de dicha propiedad en lugar del nombre de su key.
    migrarRutasAnteriores();

    // Se genera archivo CSV, primero una fila header.
    _csv = [["idUsuario", "emailUsuario", "idRecorrido", "ruta", "fechaInicio", "fechaFin", "duracion", "distanciaRecorridaKM", "desplazamientoKM", "velocidadMediaKMPorHora", "duracionPrimeraMilla", "distanciaRecorridaPrimeraMillaKM", "velocidadMediaPrimeraMillaKMPorHora", "duracionUltimaMilla", "distanciaRecorridaUltimaMillaKM", "velocidadMediaUltimaMillaKMPorHora", "duracionTroncal", "distanciaRecorridaTroncalKM", "desplazamientoTroncalKM", "velocidadMediaTroncalKMPorHora", "duracionAlimentadora", "distanciaRecorridaAlimentadora", "velocidadMediaAlimentadora", "observacionesGenerales"]];

    // Se filtran y estructuran los datos para enviarlos a librería CSV.
    if (Object.keys(datos.recorridos).length > 0) {
      for (k in datos.recorridos) {
        // No todos los recorridos recorren una milla. Se usan valores en blanco
        // en caso de no exceder la milla.
        if (datos.recorridos[k].primeraMilla == null || datos.recorridos[k].ultimaMilla == null) {
          datosPrimeraUltimaMilla = [
            '',
            '',
            '',
            '',
            '',
            ''
          ];
        } else {
          datosPrimeraUltimaMilla = [
            `${rellenarEnteroConCeros(datos.recorridos[k].primeraMilla.duracion.horas, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].primeraMilla.duracion.minutos, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].primeraMilla.duracion.segundos, 2)}`,
            `${floatAString(datos.recorridos[k].primeraMilla.distancia, 3)}`,
            `${floatAString(datos.recorridos[k].primeraMilla.velocidadMedia, 3)}`,
            `${rellenarEnteroConCeros(datos.recorridos[k].ultimaMilla.duracion.horas, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].ultimaMilla.duracion.minutos, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].ultimaMilla.duracion.segundos, 2)}`,
            `${floatAString(datos.recorridos[k].ultimaMilla.distancia, 3)}`,
            `${floatAString(datos.recorridos[k].ultimaMilla.velocidadMedia, 3)}`
          ];
        }

        // Los datos de soloCarril/troncal no están disponibles en todos los recorridos
        // Se usan valores en blanco en caso de no existir.
        if (datos.recorridos[k].soloCarril == null) {
          datosTroncal = [
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ];
        } else {
          datosTroncal = [
            `${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracion.horas, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracion.minutos, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracion.segundos, 2)}`,
            `${floatAString(datos.recorridos[k].soloCarril.distanciaRecorrida, 3)}`,
            `${floatAString(datos.recorridos[k].soloCarril.desplazamiento, 3)}`,
            `${floatAString(datos.recorridos[k].soloCarril.velocidadMedia, 3)}`,
            `${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracionAlimentadora.horas, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracionAlimentadora.minutos, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].soloCarril.duracionAlimentadora.segundos, 2)}`,
            `${floatAString(datos.recorridos[k].soloCarril.distanciaRecorridaAlimentadora, 3)}`,
            `${floatAString(datos.recorridos[k].soloCarril.velocidadMediaAlimentadora, 3)}`
          ];
        }

        _csv.push([
          String(datos.recorridos[k].usuario.id),
          datos.recorridos[k].email,
          String(k),
          datos.recorridos[k].ruta.nombre,
          fechaAString(datos.recorridos[k].fechaInicio),
          fechaAString(datos.recorridos[k].fechaFin),
          `${rellenarEnteroConCeros(datos.recorridos[k].duracion.horas, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].duracion.minutos, 2)}:${rellenarEnteroConCeros(datos.recorridos[k].duracion.segundos, 2)}`,
          `${floatAString(datos.recorridos[k].distanciaRecorrida, 3)}`,
          `${floatAString(datos.recorridos[k].desplazamiento, 3)}`,
          `${floatAString(datos.recorridos[k].velocidadMedia, 3)}`,
          datosPrimeraUltimaMilla[0],
          datosPrimeraUltimaMilla[1],
          datosPrimeraUltimaMilla[2],
          datosPrimeraUltimaMilla[3],
          datosPrimeraUltimaMilla[4],
          datosPrimeraUltimaMilla[5],
          datosTroncal[0],
          datosTroncal[1],
          datosTroncal[2],
          datosTroncal[3],
          datosTroncal[4],
          datosTroncal[5],
          datosTroncal[6],
          datos.recorridos[k].cuestionario.observaciones ? datos.recorridos[k].cuestionario.observaciones : ""
        ]);
      }
    }

    // Generando CSV usando librería.
    csv = Papa.unparse(
      _csv,
      {
        quotes: true,
        delimiter: ';',
      }
    );

    // Convirtiendo CSV en URI data.
    csv = "data:text/csv;base64," + window.btoa(csv);
    _csv = null;

    // Preparando reporte de rutas.
    _csvRutas = [["nombreRuta", "numeroRecorridos", "velocidadMediaMixta", "velocidadMediaTroncal", "velocidadMediaTotal"]];

    for (k in datos.rutas) {
      filaCSVRutas = [
        k,
        Object.keys(datos.rutas[k].recorridos).length,
        "",
        "",
        datos.rutas[k].velocidadMedia
      ];

      if ((t = Object.keys(datos.rutas[k].soloCarril.recorridos).length) > 0) {
        filaCSVRutas[2] = datos.rutas[k].soloCarril.velocidadMediaAlimentadora;
        filaCSVRutas[3] = datos.rutas[k].soloCarril.velocidadMediaTroncal;
      }

      _csvRutas.push(filaCSVRutas);
    }

    // TODO
    // Generando CSV de sumario de rutas
    csvRutas = Papa.unparse(
      _csvRutas,
      {
        quotes: true,
        delimiter: ';',
      }
    );

    //console.log(csvRutas);

    // Convirtiendo CSV en URI data.
    csvRutas = "data:text/csv;base64," + window.btoa(csvRutas);
    _csvRutas = null;
  };

  var arreglarExpandirColapsar = function(elemento) {
    elemento.classList.toggle("show");
  };

  var crearElementoRecorrido = function(id, elementoPadre, mostrarRuta, mostrarUsuario) {
    var elemento = document.createElement('a');

    elemento.href = "#";
    elemento.className = "list-group-item list-group-item-action";
    elemento.innerHTML = "";

    if (mostrarRuta) {
      elemento.innerHTML += "<strong>Ruta:</strong> " + datos.recorridos[id].ruta.nombre + "<br />";
    }

    if (mostrarUsuario) {
      elemento.innerHTML += "<strong>Usuario:</strong> " + datos.recorridos[id].usuario.email + "<br />";
    }

    elemento.innerHTML += "<strong>Inicio:</strong> " + fechaAString(datos.recorridos[id].fechaInicio) + "<br /><strong>Fin:</strong> " + fechaAString(datos.recorridos[id].fechaFin);

    elemento.addEventListener("click", function(e) {
      mostrarRecorrido(id, true);
      mostrarDetallesRecorrido(id);

      e.preventDefault();
    });

    elementoPadre.appendChild(elemento);
  };

  var crearElementoRuta = function(id) {
    var i;

    var elementoTitulo = document.createElement("h3");
    elementoTitulo.className = "panel-title panel-subtitle";

    var elementoEnlaceTitulo = document.createElement("a");
    elementoEnlaceTitulo.href = "#";
    elementoEnlaceTitulo.className = "list-group-item list-group-item-action";
    elementoEnlaceTitulo.dataset.toggle = "collapse";
    elementoEnlaceTitulo.dataset.target = "#ruta" + id;
    elementoEnlaceTitulo.dataset.parent = "#rutas";
    elementoEnlaceTitulo.textContent = datos.rutas[id].nombre + " (" + Object.keys(datos.rutas[id].recorridos).length + ")";
    elementoEnlaceTitulo.addEventListener("click", function(e) {
      e.preventDefault();
    });

    var elementoContenedorRutas = document.createElement("div");
    elementoContenedorRutas.id = "#ruta" + id;
    elementoContenedorRutas.className = "panel collapse";

    var elementoTodoRuta = document.createElement('a');

    elementoTodoRuta.href = "#";
    elementoTodoRuta.className = "list-group-item list-group-item-action panel-sub-subtitle";
    elementoTodoRuta.textContent = "Todo";

    elementoTodoRuta.addEventListener("click", function(e) {
      mostrarRuta(id);
      mostrarDetallesRuta(id);

      e.preventDefault();
    });

    elementoContenedorRutas.appendChild(elementoTodoRuta);

    for (i in datos.rutas[id].recorridos) {
      crearElementoRecorrido(i, elementoContenedorRutas, false, true);
    }

    elementoTitulo.addEventListener("click", function(e){
      arreglarExpandirColapsar(elementoContenedorRutas);

      e.preventDefault();
    });

    elementoTitulo.appendChild(elementoEnlaceTitulo);
    elementoRutas.appendChild(elementoTitulo);
    elementoRutas.appendChild(elementoContenedorRutas);
  };

  var crearElementoUsuario = function(id) {
    var i;

    var elementoTitulo = document.createElement("h3");
    elementoTitulo.className = "panel-title panel-subtitle";

    var elementoEnlaceTitulo = document.createElement("a");
    elementoEnlaceTitulo.href = "#";
    elementoEnlaceTitulo.className = "list-group-item list-group-item-action";
    elementoEnlaceTitulo.dataset.toggle = "collapse";
    elementoEnlaceTitulo.dataset.target = "#usuario" + id;
    elementoEnlaceTitulo.dataset.parent = "#usuarios";
    elementoEnlaceTitulo.textContent = datos.usuarios[id].email + " (" + Object.keys(datos.usuarios[id].recorridos).length + ")";
    elementoEnlaceTitulo.addEventListener("click", function(e){
      e.preventDefault();
    });

    var elementoContenedorRecorridos = document.createElement("div");
    elementoContenedorRecorridos.id = "#usuario" + id;
    elementoContenedorRecorridos.className = "panel collapse";

    var elementoTodoUsuario = document.createElement('a');

    elementoTodoUsuario.href = "#";
    elementoTodoUsuario.className = "list-group-item list-group-item-action panel-sub-subtitle";
    elementoTodoUsuario.textContent = "Todo";

    elementoTodoUsuario.addEventListener("click", function(e) {
      mostrarUsuario(id);
      mostrarDetallesUsuario(id);

      e.preventDefault();
    });

    elementoContenedorRecorridos.appendChild(elementoTodoUsuario);

    for (i in datos.usuarios[id].recorridos) {
      crearElementoRecorrido(i, elementoContenedorRecorridos, true, false);
    }

    elementoTitulo.addEventListener("click", function(e){
      arreglarExpandirColapsar(elementoContenedorRecorridos);

      e.preventDefault();
    });

    elementoTitulo.appendChild(elementoEnlaceTitulo);
    elementoUsuarios.appendChild(elementoTitulo);
    elementoUsuarios.appendChild(elementoContenedorRecorridos);
  };

  // Para versiones del cuestionario anteriores sin un campo "version"
  var crearHTMLCuestionarioAnterior = function(id) {
    var cuestionario = datos.recorridos[id].cuestionario;
    var i;
    var j;

    var temp;

    // version 1: tipoPregunta y tipoCuestionario son ints, 5 preguntas sin enunciado.
    // version 2: tipoPregunta y tipoCuestionario son int, 7 preguntas sin enunciado.
    // version 3: tipoPregunta y tipoCuestionario son strings, 18 preguntas con enunciado.
    var version = 1;

    if ((typeof cuestionario.preguntas[0].tipoPregunta) === "string") {
      version = 3;
    } else if (cuestionario.preguntas.length > 5) {
      version = 2;
    }

    var tipo = "Transcaribe";

    if (version == 3) {
      tipo = cuestionario.tipoCuestionario;
    }

    var observacionesCuestionario = "no disponible";

    if (cuestionario.hasOwnProperty("observaciones") && cuestionario.observaciones != null && (temp = cuestionario.observaciones.trim()) != "") {
      observacionesCuestionario = temp;
    }

    var htmlPreguntas = "<ul>";

    var enunciado;
    var respuesta;
    var observaciones;

    var descripcionesRespuestaCuantitativa;

    var htmlRespuesta;
    var htmlObservaciones;

    if (version < 3) {
      for (i in cuestionario.preguntas) {
        switch (parseInt(i)) {
          case 0:
            enunciado = "¿Extintores a la vista?";
            break;
          case 1:
            enunciado = "¿Salidas de emergencia señalizadas?";
            break;
          case 2:
            enunciado = "¿Algún inconveniente durante el recorrido dentro del bus?";
            break;
          case 3:
            enunciado = "¿Señalización de estaciones dentro del bus? Anuncios de paradas y planos.";
            break;
          case 4:
            enunciado = "¿Incidentes en la carretera?";
            break;
          case 5:
            enunciado = "¿Daños en el aire acondicionado o fugas de agua?";
            break;
          case 6:
            enunciado = "¿Malos olores?";
            break;
          default:
            enunciado = "Pregunta no disponible";
            break;
        }

        respuesta = cuestionario.preguntas[i].respuesta.valor;

        htmlObservaciones = "";

        if (cuestionario.preguntas[i].respuesta.hasOwnProperty("observaciones") && (observaciones = cuestionario.preguntas[i].respuesta.observaciones) != null && (observaciones = observaciones.trim()) != "") {
          htmlObservaciones = `<ul><li><strong>Observaciones adicionales</strong>: ${ observaciones }</li></ul>`;
        }

        htmlPreguntas += `<li><span class="enunciado-pregunta">${ enunciado }</span> <span class="${ respuesta ? "respuesta-si" : "respuesta-no" }">${ respuesta ? "Sí" : "No" }</span>${htmlObservaciones}</li>`;
      }
    } else {
      for (i in cuestionario.preguntas) {
        enunciado = cuestionario.preguntas[i].enunciado;
        respuesta = cuestionario.preguntas[i].respuesta.valor;

        switch (cuestionario.preguntas[i].tipoPregunta) {
          case "VerdaderoFalso":
            htmlRespuesta = `<span class="${ respuesta ? "respuesta-si" : "respuesta-no" }">${ respuesta ? "Sí" : "No" }</span>`;
            break;
          case "Cuantitativa":
            descripcionesRespuestaCuantitativa = `Respuesta: ${ respuesta + 1 } de ${ cuestionario.preguntas[i].valorMaximo + 1 }\n\nOpciones:\n`;

            for (j in cuestionario.preguntas[i].descripcionesDeOpciones) {
              descripcionesRespuestaCuantitativa += (parseInt(j) + 1) + " = " + cuestionario.preguntas[i].descripcionesDeOpciones[j];

              if (parseInt(j) < cuestionario.preguntas[i].valorMaximo) {
                descripcionesRespuestaCuantitativa += "\n";
              }
            }

            htmlRespuesta = `<span class="respuesta-${ respuesta + 1 }-de-5" title="${ descripcionesRespuestaCuantitativa }">${ cuestionario.preguntas[i].descripcionesDeOpciones[respuesta] }</span>`;
            break;
          default:
            htmlRespuesta = "Respuesta desconocida.";
            break;
        }

        htmlObservaciones = "";

        if (cuestionario.preguntas[i].respuesta.hasOwnProperty("observaciones") && (observaciones = cuestionario.preguntas[i].respuesta.observaciones) != null && (observaciones = observaciones.trim()) != "") {
          htmlObservaciones = `<ul><li><strong>Observaciones adicionales</strong>: ${ observaciones }</li></ul>`;
        }

        htmlPreguntas += `<li><span class="enunciado-pregunta">${ enunciado }</span> ${ htmlRespuesta }${ htmlObservaciones }</li>`;
      }
    }

    htmlPreguntas += "</ul>";

    var htmlCuestionario = `<ul>
      <li><strong>Tipo de cuestionario</strong>: ${ tipo }</li>
      <li><strong>Versión de cuestionario</strong>: ${ version }</li>
      <li><strong>Preguntas</strong>: ${ htmlPreguntas }</li>
      <li><strong>Observaciones generales adicionales</strong>: ${ observacionesCuestionario }</li>
    </ul>`;

    return htmlCuestionario;
  };

  var crearHTMLCuestionario = function(id) {
    var cuestionario = datos.recorridos[id].cuestionario;

    if (!cuestionario.hasOwnProperty("version") || cuestionario.version == null || cuestionario.version < 4) {
      return crearHTMLCuestionarioAnterior(id);
    }
    // TODO! Remover y agregar código con versión revisada de cuestionario
    else {
      return crearHTMLCuestionarioAnterior(id);
    }

    htmlCuestionario = ""; // Por ahora funciona porque no hay versiones aún.

    return htmlCuestionario;
  };

  var mostrarDetallesRecorrido = function(id) {
    var htmlDetalles = `<ul>
      <li><strong>Usuario</strong>: <ul>
        <li><strong>Email</strong>: ${ datos.recorridos[id].email }</li>
        <li><strong>ID</strong>: ${ datos.recorridos[id].usuario.id }</li>
      </ul></li>
      <li><strong>Recorrido</strong>: <ul>
        <li><strong>ID</strong>: ${ id }</li>
        <li><strong>Ruta</strong>: ${ datos.recorridos[id].ruta.nombre }</li>
        <li><strong>Velocidad Media</strong>: ${ floatAString(datos.recorridos[id].velocidadMedia, 3) } km/h</li>
        <li><strong>Distancia Recorrida</strong>: ${ floatAString(datos.recorridos[id].distanciaRecorrida, 3) } km</li>
        <li><strong>Desplazamiento</strong>: ${ floatAString(datos.recorridos[id].desplazamiento, 3) } km</li>
        <li><strong>Número de puntos capturados</strong>: ${ datos.recorridos[id].puntos.length }</li>
        <li><strong>Duración</strong>: <a title="${ datos.recorridos[id]._fechaFin - datos.recorridos[id]._fechaInicio } milisegundos" class="duracion">${ datos.recorridos[id].duracion.horas + ' horas, ' + datos.recorridos[id].duracion.minutos + ' minutos, ' + datos.recorridos[id].duracion.segundos } segundos</a></li>
        <li><strong>Fecha Inicio</strong>: ${ fechaAString(datos.recorridos[id].fechaInicio) }</li>
        <li><strong>Fecha Fin</strong>: ${ fechaAString(datos.recorridos[id].fechaFin) }</li>`;

    var htmlPrimeraMilla = "<li><strong>Datos de primera milla</strong>: ";
    var htmlUltimaMilla = "<li><strong>Datos de última milla</strong>: ";
    if (datos.recorridos[id].primeraMilla == null || datos.recorridos[id].ultimaMilla == null) {
      htmlPrimeraMilla += "no disponible";
      htmlUltimaMilla += "no disponible";
    } else {
      htmlPrimeraMilla += `<ul>
        <li><strong>Duración</strong>: <a title="${ Math.floor(datos.recorridos[id].primeraMilla._duracion) } milisegundos" class="duracion">${ datos.recorridos[id].primeraMilla.duracion.horas + ' horas, ' + datos.recorridos[id].primeraMilla.duracion.minutos + ' minutos, ' + datos.recorridos[id].primeraMilla.duracion.segundos } segundos</a></li>
        <li><strong>Distancia Recorrida</strong>: ${ floatAString(datos.recorridos[id].primeraMilla.distancia, 3) } km</li>
        <li><strong>Velocidad Media</strong>: ${ floatAString(datos.recorridos[id].primeraMilla.velocidadMedia, 3) } km/h</li>
      </ul>`;
      htmlUltimaMilla += `<ul>
        <li><strong>Duración</strong>: <a title="${ Math.floor(datos.recorridos[id].ultimaMilla._duracion) } milisegundos" class="duracion">${ datos.recorridos[id].ultimaMilla.duracion.horas + ' horas, ' + datos.recorridos[id].ultimaMilla.duracion.minutos + ' minutos, ' + datos.recorridos[id].ultimaMilla.duracion.segundos } segundos</a></li>
        <li><strong>Distancia Recorrida</strong>: ${ floatAString(datos.recorridos[id].ultimaMilla.distancia, 3) } km</li>
        <li><strong>Velocidad Media</strong>: ${ floatAString(datos.recorridos[id].ultimaMilla.velocidadMedia, 3) } km/h</li>
      </ul>`;
    }
    htmlDetalles += htmlPrimeraMilla + "</li>" + htmlUltimaMilla + "</li>";

    var htmlSoloCarril = "<li><strong>Datos dentro de la troncal</strong>: ";
    if (datos.recorridos[id].soloCarril == null) {
      htmlSoloCarril += "no disponible";
    } else {
      htmlSoloCarril += `<ul>
        <li><strong>Duración</strong>: <a title="${ datos.recorridos[id].soloCarril._duracion } milisegundos" class="duracion">${ datos.recorridos[id].soloCarril.duracion.horas + ' horas, ' + datos.recorridos[id].soloCarril.duracion.minutos + ' minutos, ' + datos.recorridos[id].soloCarril.duracion.segundos } segundos</a></li>
        <li><strong>Desplazamiento</strong>: ${ floatAString(datos.recorridos[id].soloCarril.desplazamiento, 3) } km</li>
        <li><strong>Distancia Recorrida</strong>: ${ floatAString(datos.recorridos[id].soloCarril.distanciaRecorrida, 3) } km</li>
        <li><strong>Velocidad Media</strong>: ${ floatAString(datos.recorridos[id].soloCarril.velocidadMedia, 3) } km/h</li>
      </ul>`;
    }
    htmlDetalles += htmlSoloCarril + "</li>";

    htmlDetalles += "</ul></li>";

    var htmlCuestionario = "<li><strong>Cuestionario</strong>: ";
    if (!datos.recorridos[id].hasOwnProperty("cuestionario") || datos.recorridos[id].cuestionario == null || !datos.recorridos[id].cuestionario.hasOwnProperty("preguntas") || Object.keys(datos.recorridos[id].cuestionario.preguntas).length < 1) {
      htmlCuestionario += 'no disponible';
    } else {
      htmlCuestionario += crearHTMLCuestionario(id);
    }
    htmlDetalles += htmlCuestionario + "</li>";

    htmlDetalles += '</ul>';

    elementoTituloDetalles.textContent = "Detalles: Recorrido";
    elementoDetalles.innerHTML = htmlDetalles;
  };

  var mostrarDetallesUsuario = function(id) {
    var rutasNombres = [];
    var rutasTotales = [];
    var i;
    var j;

    var primeraFechaInicio = null;
    var primeraFechaFin;
    var ultimaFechaInicio = null;
    var ultimaFechaFin;

    if (Object.keys(datos.usuarios[id].recorridos).length == 0) {
      primeraFechaInicio = "no disponible";
      ultimaFechaInicio = "no disponible";
    } else {
      for (i in datos.usuarios[id].recorridos) {
        if ((j = rutasNombres.indexOf(datos.usuarios[id].recorridos[i].ruta.nombre)) == -1) {
          rutasNombres.push(datos.usuarios[id].recorridos[i].ruta.nombre);
          rutasTotales.push(1);
        } else {
          rutasTotales[j]++;
        }

        if (primeraFechaInicio == null || ultimaFechaInicio == null) {
          primeraFechaInicio = datos.usuarios[id].recorridos[i].fechaInicio;
          primeraFechaFin = datos.usuarios[id].recorridos[i].fechaFin;
          ultimaFechaInicio = datos.usuarios[id].recorridos[i].fechaInicio;
          ultimaFechaFin = datos.usuarios[id].recorridos[i].fechaFin;

          continue;
        }

        if (datos.usuarios[id].recorridos[i].fechaInicio < primeraFechaInicio) {
          primeraFechaInicio = datos.usuarios[id].recorridos[i].fechaInicio;
          primeraFechaFin = datos.usuarios[id].recorridos[i].fechaFin;
        }

        if (datos.usuarios[id].recorridos[i].fechaInicio > ultimaFechaInicio) {
          ultimaFechaInicio = datos.usuarios[id].recorridos[i].fechaInicio;
          ultimaFechaFin = datos.usuarios[id].recorridos[i].fechaFin;
        }
      }
    }

    var htmlPrimeraFecha;
    var htmlUltimaFecha;
    var htmlRutas;

    if (rutasNombres.length == 0) {
      htmlPrimeraFecha = primeraFechaInicio;
      htmlUltimaFecha = ultimaFechaInicio;

      htmlRutas = "ninguna";
    } else {
      htmlPrimeraFecha = fechaAString(primeraFechaInicio) + " - " + fechaAString(primeraFechaFin);
      htmlUltimaFecha = fechaAString(ultimaFechaInicio) + " - " + fechaAString(ultimaFechaFin);

      htmlRutas = "<ul>";

      for (i in rutasNombres) {
        htmlRutas += "<li>" + rutasNombres[i] + " (" + rutasTotales[i] + ")</li>";
      }

      htmlRutas += "</ul>";
    }

    var htmlDetalles = `<ul>
      <li><strong>Email</strong>: ${ datos.usuarios[id].email }</li>
      <li><strong>ID</strong>: ${ id }</li>
      <li><strong>Número de recorridos</strong>: ${ Object.keys(datos.usuarios[id].recorridos).length }</li>
      <li><strong>Rutas transitadas</strong>: ${ htmlRutas }</li>
      <li><strong>Fecha primer recorrido</strong>: ${ htmlPrimeraFecha }</li>
      <li><strong>Fecha recorrido más reciente</strong>: ${ htmlUltimaFecha }</li>
    </ul>`;

    elementoTituloDetalles.textContent = "Detalles: Usuario";
    elementoDetalles.innerHTML = htmlDetalles;
  };

  var mostrarDetallesRuta = function(id) {
    var numeroRecorridos = Object.keys(datos.rutas[id].recorridos).length;

    var distanciaTotal = 0;
    var duracionTotal = 0;
    var velocidadTotal = 0;

    var distanciaMedia;
    var duracionMedia;
    var velocidadMedia;

    var primeraFechaInicio = null;
    var primeraFechaFin;
    var ultimaFechaInicio = null;
    var ultimaFechaFin;
    var htmlPrimeraFecha;
    var htmlUltimaFecha;
    var htmlPrimeraMilla;
    var htmlUltimaMilla;
    var htmlSoloCarril;

    var usuarios = [];
    var duracion;
    var t;
    var i;

    for (i in datos.rutas[id].recorridos) {
      if (usuarios.indexOf(datos.rutas[id].recorridos[i].usuario.id) == -1) {
        usuarios.push(datos.rutas[id].recorridos[i].usuario.id);
      }

      if (primeraFechaInicio == null || ultimaFechaInicio == null) {
        primeraFechaInicio = datos.rutas[id].recorridos[i].fechaInicio;
        primeraFechaFin = datos.rutas[id].recorridos[i].fechaFin;
        ultimaFechaInicio = datos.rutas[id].recorridos[i].fechaInicio;
        ultimaFechaFin = datos.rutas[id].recorridos[i].fechaFin;
      } else {
        if (datos.rutas[id].recorridos[i].fechaInicio < primeraFechaInicio) {
          primeraFechaInicio = datos.rutas[id].recorridos[i].fechaInicio;
          primeraFechaFin = datos.rutas[id].recorridos[i].fechaFin;
        }

        if (datos.rutas[id].recorridos[i].fechaInicio > ultimaFechaInicio) {
          ultimaFechaInicio = datos.rutas[id].recorridos[i].fechaInicio;
          ultimaFechaFin = datos.rutas[id].recorridos[i].fechaFin;
        }
      }

      distanciaTotal += datos.rutas[id].recorridos[i].distanciaRecorrida;
      duracionTotal += datos.rutas[id].recorridos[i]._fechaFin - datos.rutas[id].recorridos[i]._fechaInicio;
      velocidadTotal += datos.rutas[id].recorridos[i].velocidadMedia;
    }

    if (numeroRecorridos > 0) {
      duracion = diferenciaTimestamps(0, duracionTotal / numeroRecorridos);

      distanciaMedia = floatAString(distanciaTotal / numeroRecorridos, 3) + " km";
      duracionMedia = `<a title="${ Math.floor(duracionTotal / numeroRecorridos) + " milisegundos"}" class="duracion">${ duracion.horas } horas, ${ duracion.minutos } minutos, ${ duracion.segundos } segundos</a>`;
      velocidadMedia = floatAString(velocidadTotal / numeroRecorridos, 3) + " km/h";

      htmlPrimeraFecha = fechaAString(primeraFechaInicio) + " - " + fechaAString(primeraFechaFin);
      htmlUltimaFecha = fechaAString(ultimaFechaInicio) + " - " + fechaAString(ultimaFechaFin);

      if ((t = Object.keys(datos.rutas[id].primeraMilla.recorridos).length) > 0) {
        htmlPrimeraMilla =
        `<ul>
          <li><strong>Número de recorridos con esta información</strong>: ${ t } de ${ Object.keys(datos.rutas[id].recorridos).length } recorridos</li>
          <li><strong>Duración media en la primera milla</strong>: <a title="${ Math.floor(datos.rutas[id].primeraMilla._duracionMedia) + " milisegundos"}" class="duracion">${ datos.rutas[id].primeraMilla.duracionMedia.horas } horas, ${ datos.rutas[id].primeraMilla.duracionMedia.minutos } minutos, ${ datos.rutas[id].primeraMilla.duracionMedia.segundos } segundos</a></li>
          <li><strong>Distancia media recorrida en la primera milla</strong>: ${ floatAString(datos.rutas[id].primeraMilla.distanciaMedia, 3) } km</li>
          <li><strong>Velocidad media en la primera milla</strong>: ${ floatAString(datos.rutas[id].primeraMilla.velocidadMedia, 3) } km/h</li>
        </ul>`;
        htmlUltimaMilla =
        `<ul>
          <li><strong>Número de recorridos con esta información</strong>: ${ t } de ${ Object.keys(datos.rutas[id].recorridos).length } recorridos</li>
          <li><strong>Duración media en la última milla</strong>: <a title="${ Math.floor(datos.rutas[id].ultimaMilla._duracionMedia) + " milisegundos"}" class="duracion">${ datos.rutas[id].ultimaMilla.duracionMedia.horas } horas, ${ datos.rutas[id].ultimaMilla.duracionMedia.minutos } minutos, ${ datos.rutas[id].ultimaMilla.duracionMedia.segundos } segundos</a></li>
          <li><strong>Distancia media recorrida en la última milla</strong>: ${ floatAString(datos.rutas[id].ultimaMilla.distanciaMedia, 3) } km</li>
          <li><strong>Velocidad media en la última milla</strong>: ${ floatAString(datos.rutas[id].ultimaMilla.velocidadMedia, 3) } km/h</li>
        </ul>`;
      } else {
        htmlPrimeraMilla = "no disponible aún para esta ruta";
        htmlUltimaMilla = "no disponible aún para esta ruta";
      }

      if ((t = Object.keys(datos.rutas[id].soloCarril.recorridos).length) > 0) {
        htmlSoloCarril =
        `<ul>
          <li><strong>Recorridos completos de la troncal</strong>: ${ t } de ${ Object.keys(datos.rutas[id].recorridos).length } recorridos</li>
          <li><strong>Datos <em>mixtos</em> de estos ${ t } recorridos</strong>: <ul>
            <li><strong>Duración media <em>mixta</em></strong>: <a title="${ Math.floor(datos.rutas[id].soloCarril._duracionMediaTotal) } milisegundos" class="duracion">${ datos.rutas[id].soloCarril.duracionMediaTotal.horas + ' horas, ' + datos.rutas[id].soloCarril.duracionMediaTotal.minutos + ' minutos, ' + datos.rutas[id].soloCarril.duracionMediaTotal.segundos } segundos</a></li>
            <li><strong>Distancia recorrida media <em>mixta</em></strong>: ${floatAString(datos.rutas[id].soloCarril.distanciaMediaTotal, 3)} km</li>
            <li><strong>Desplazamiento medio <em>mixto</em></strong>: ${floatAString(datos.rutas[id].soloCarril.desplazamientoMedioTotal, 3)} km</li>
            <li><strong>Velocidad media <em>mixta</em></strong>: ${ floatAString(datos.rutas[id].soloCarril.velocidadMediaTotal, 3) } km/h</li>
          </ul></li>
          <li><strong>Datos <em>dentro</em> de la troncal de estos ${ t } recorridos</strong>: <ul>
            <li><strong>Duración media <em>dentro</em> de la troncal</strong>: <a title="${ Math.floor(datos.rutas[id].soloCarril._duracionMediaTroncal) } milisegundos" class="duracion">${ datos.rutas[id].soloCarril.duracionMediaTroncal.horas + ' horas, ' + datos.rutas[id].soloCarril.duracionMediaTroncal.minutos + ' minutos, ' + datos.rutas[id].soloCarril.duracionMediaTroncal.segundos } segundos</a></li>
            <li><strong>Distancia recorrida media <em>dentro</em> de la troncal</strong>: ${floatAString(datos.rutas[id].soloCarril.distanciaMediaTroncal, 3)} km</li>
            <li><strong>Desplazamiento medio <em>dentro</em> de la troncal</strong>: ${floatAString(datos.rutas[id].soloCarril.desplazamientoMedioTroncal, 3)} km</li>
            <li><strong>Velocidad media <em>dentro</em> de la troncal</strong>: ${ floatAString(datos.rutas[id].soloCarril.velocidadMediaTroncal, 3) } km/h</li>
          </ul></li>
          <li><strong>Datos <em>afuera</em> de la troncal de estos ${ t } recorridos</strong>: <ul>
            <li><strong>Duración media <em>afuera</em> de la troncal</strong>: <a title="${ Math.floor(datos.rutas[id].soloCarril._duracionMediaAlimentadora) } milisegundos" class="duracion">${ datos.rutas[id].soloCarril.duracionMediaAlimentadora.horas + ' horas, ' + datos.rutas[id].soloCarril.duracionMediaAlimentadora.minutos + ' minutos, ' + datos.rutas[id].soloCarril.duracionMediaAlimentadora.segundos } segundos</a></li>
            <li><strong>Distancia recorrida media <em>afuera</em> de la troncal</strong>: ${floatAString(datos.rutas[id].soloCarril.distanciaMediaAlimentadora, 3)} km</li>
            <li><strong>Velocidad media <em>afuera</em> de la troncal</strong>: ${ floatAString(datos.rutas[id].soloCarril.velocidadMediaAlimentadora, 3) } km/h</li>
          </ul></li>
        </ul>`;
      } else {
        htmlSoloCarril = "no disponible para esta ruta";
      }
    } else {
      distanciaMedia = "no disponible";
      duracionMedia = "no disponible";
      velocidadMedia = "no disponible";

      htmlPrimeraFecha = "no disponible";
      htmlUltimaFecha = "no disponible";

      htmlPrimeraMilla = "no disponible";
      htmlUltimaMilla = "no disponible";
      htmlSoloCarril = "no disponible";
    }

    var htmlDetalles = `<ul>
      <li><strong>Nombre</strong>: ${ datos.rutas[id].nombre }</li>
      <li><strong>Número de recorridos</strong>: ${ numeroRecorridos }</li>
      <li><strong>Distancia media</strong>: ${ distanciaMedia }</li>
      <li><strong>Duración media</strong>: ${ duracionMedia }</li>
      <li><strong>Velocidad media</strong>: ${ velocidadMedia } </li>
      <li><strong>Usuarios</strong>: ${ usuarios.length } </li>
      <li><strong>Fecha primer recorrido</strong>: ${ htmlPrimeraFecha }</li>
      <li><strong>Fecha recorrido más reciente</strong>: ${ htmlUltimaFecha }</li>
      <li><strong>Detalles de primera milla</strong>: ${ htmlPrimeraMilla }</li>
      <li><strong>Detalles de última milla</strong>: ${ htmlUltimaMilla }</li>
      <li><strong>Detalles dentro de la troncal</strong>: ${ htmlSoloCarril }</li>
    </ul>`;

    elementoTituloDetalles.textContent = "Detalles: Ruta";
    elementoDetalles.innerHTML = htmlDetalles;
  };

  var mostrarDetallesTodo = function() {
    var primeraFechaInicio = null;
    var primeraFechaFin;
    var ultimaFechaInicio = null;
    var ultimaFechaFin;

    var htmlPrimeraFecha;
    var htmlUltimaFecha;

    var i;

    for (i in datos.recorridos) {
      if (primeraFechaInicio == null || ultimaFechaInicio == null) {
        primeraFechaInicio = datos.recorridos[i].fechaInicio;
        primeraFechaFin = datos.recorridos[i].fechaFin;
        ultimaFechaInicio = datos.recorridos[i].fechaInicio;
        ultimaFechaFin = datos.recorridos[i].fechaFin;
      } else {
        if (datos.recorridos[i].fechaInicio < primeraFechaInicio) {
          primeraFechaInicio = datos.recorridos[i].fechaInicio;
          primeraFechaFin = datos.recorridos[i].fechaFin;
        }

        if (datos.recorridos[i].fechaInicio > ultimaFechaInicio) {
          ultimaFechaInicio = datos.recorridos[i].fechaInicio;
          ultimaFechaFin = datos.recorridos[i].fechaFin;
        }
      }
    }

    if (Object.keys(datos.recorridos).length > 0) {
      htmlPrimeraFecha = fechaAString(primeraFechaInicio) + " - " + fechaAString(primeraFechaFin);
      htmlUltimaFecha = fechaAString(ultimaFechaInicio) + " - " + fechaAString(ultimaFechaFin);
    } else {
      htmlPrimeraFecha = "no disponible";
      htmlUltimaFecha = "no disponible";
    }

    var htmlDetalles = `<ul>
      <li><a href="${csv}" download="datos.csv">Descargar CSV</a></li>
      <li><strong>Número de recorridos</strong>: ${ Object.keys(datos.recorridos).length }</li>
      <li><strong>Usuarios</strong>: ${ Object.keys(datos.usuarios).length }</li>
      <li><strong>Rutas</strong>: ${ Object.keys(datos.rutas).length }</li>
      <li><strong>Fecha primer recorrido</strong>: ${ htmlPrimeraFecha }</li>
      <li><strong>Fecha recorrido más reciente</strong>: ${ htmlUltimaFecha }</li>
    </ul>`;

    elementoTituloDetalles.textContent = "Detalles: Todo";
    elementoDetalles.innerHTML = htmlDetalles;
  };

  var construirMenu = function() {
    var i;

    elementoTodoTitulo.textContent = "Recorridos (" + Object.keys(datos.recorridos).length + ")";
    elementoTodo.addEventListener("click", function(e) {
      mostrarTodo();
      mostrarDetallesTodo();

      e.preventDefault();
    });

    elementoUsuariosTitulo.textContent = "Usuarios (" + Object.keys(datos.usuarios).length + ")";
    for (i in datos.usuarios) {
      crearElementoUsuario(i);
    }

    elementoRutasTitulo.textContent = "Rutas (" + Object.keys(datos.rutas).length + ")";
    for (i in datos.rutas) {
      crearElementoRuta(i);
    }

    for (i in datos.recorridos) {
      crearElementoRecorrido(i, elementoRecorridos, true, true);
    }

    if (elementoNada != null) {
      elementoNada.addEventListener("click", function(e) {
        vaciarMapa();

        elementoTituloDetalles.textContent = "";
        elementoDetalles.innerHTML = "";

        e.preventDefault();
      });
    }
  };

  var main = function() {
    leerDatos();
    crearMapa();
    construirMenu();
    mostrarTodo();
    mostrarDetallesTodo();
  };

  return {
    "main": main
  };
})();

TransQA.main();
