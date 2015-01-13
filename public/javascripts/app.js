// Based on the Google Chrome WebSpeech example https://github.com/GoogleChrome/webplatform-samples

var socket = io.connect('http://localhost:3000');

var langs =
[['Afrikaans',       ['af-ZA']],
['Bahasa Indonesia',['id-ID']],
['Bahasa Melayu',   ['ms-MY']],
['Català',          ['ca-ES']],
['Čeština',         ['cs-CZ']],
['Deutsch',         ['de-DE']],
['English',         ['en-AU', 'Australia'],
['en-CA', 'Canada'],
['en-IN', 'India'],
['en-NZ', 'New Zealand'],
['en-ZA', 'South Africa'],
['en-GB', 'United Kingdom'],
['en-US', 'United States']],
['Español',         ['es-AR', 'Argentina'],
['es-BO', 'Bolivia'],
['es-CL', 'Chile'],
['es-CO', 'Colombia'],
['es-CR', 'Costa Rica'],
['es-EC', 'Ecuador'],
['es-SV', 'El Salvador'],
['es-ES', 'España'],
['es-US', 'Estados Unidos'],
['es-GT', 'Guatemala'],
['es-HN', 'Honduras'],
['es-MX', 'México'],
['es-NI', 'Nicaragua'],
['es-PA', 'Panamá'],
['es-PY', 'Paraguay'],
['es-PE', 'Perú'],
['es-PR', 'Puerto Rico'],
['es-DO', 'República Dominicana'],
['es-UY', 'Uruguay'],
['es-VE', 'Venezuela']],
['Euskara',         ['eu-ES']],
['Français',        ['fr-FR']],
['Galego',          ['gl-ES']],
['Hrvatski',        ['hr_HR']],
['IsiZulu',         ['zu-ZA']],
['Íslenska',        ['is-IS']],
['Italiano',        ['it-IT', 'Italia'],
['it-CH', 'Svizzera']],
['Magyar',          ['hu-HU']],
['Nederlands',      ['nl-NL']],
['Norsk bokmål',    ['nb-NO']],
['Polski',          ['pl-PL']],
['Português',       ['pt-BR', 'Brasil'],
['pt-PT', 'Portugal']],
['Română',          ['ro-RO']],
['Slovenčina',      ['sk-SK']],
['Suomi',           ['fi-FI']],
['Svenska',         ['sv-SE']],
['Türkçe',          ['tr-TR']],
['български',       ['bg-BG']],
['Pусский',         ['ru-RU']],
['Српски',          ['sr-RS']],
['한국어',            ['ko-KR']],
['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
['cmn-Hans-HK', '普通话 (香港)'],
['cmn-Hant-TW', '中文 (台灣)'],
['yue-Hant-HK', '粵語 (香港)']],
['日本語',           ['ja-JP']],
['Lingua latīna',   ['la']]];

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}
//
// var create_email = false;
// var final_transcript = '';
var recognizing = false;
var ignore_onend;
// var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  // You're browser does not support webspeech
  alert('Your browser does not support the necessary Speech features.')
  console.error('Your browser does not support WebSpeech');
} else {

  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      console.error('Your computer does not have speech capabilities');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      console.error('Your computer does not have speech capabilities');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        // console.log(event.results[i][0].transcript);
        final_transcript += event.results[i][0].transcript;
      } else {
        // console.log(event.results[i][0].transcript);
        interim_transcript += event.results[i][0].transcript;
      }
    }
    if (final_transcript != ''){
      console.log("[FINAL]:", final_transcript);
      socket.emit('search:query', final_transcript);
      final_transcript = '';
      interim_transcript = '';
    }
    else {
      socket.emit('search:query', interim_transcript);
      console.log("[INTERIM]:", interim_transcript);
    }
  };
}

socket.on('search:result', function(results){
  var images = document.getElementById('images');
  images.innerHTML = '';
  for (var i=0; i<results.length; i++){
    var node = document.createElement("img");
    var a = document.createAttribute("src");
    a.value = results[i].unescapedUrl;
    node.setAttributeNode(a);
    images.appendChild(node);
  }

});

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    socket.emit('search:query', 'elephant');
    console.log('elephand');
  }
}

// var two_line = /\n\n/g;
// var one_line = /\n/g;
// function linebreak(s) {
//   return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
// }
//
// var first_char = /\S/;
// function capitalize(s) {
//   return s.replace(first_char, function(m) { return m.toUpperCase(); });
// }

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  start_timestamp = event.timeStamp;
}
