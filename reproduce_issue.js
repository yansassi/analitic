
const Papa = require('papaparse');

const csvContent = `Conteúdo,Título do vídeo,Horário de publicação do vídeo,Duração,Visualizações intencionais
VZKUW1_M8mU,Piores momentos do futebol. #futebol #futebolmelhoresmomentos #shorts,"Dec 4, 2024",35,10535
L_KwOTvKTGA,Corinthians não é mais o mesmo ? #futebol #Corinthians #neymar #santos #libertadores #brasileirao,"Oct 17, 2025",37,6307`;

const parseYT = (text) => Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (h) => h.trim().replace(/^"|"$/g, '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}).data;

const data = parseYT(csvContent);

console.log("Parsed Data Keys:", Object.keys(data[0]));

const processVideoData = (data) => {
    return data.map((row) => ({
        id: row['id do conteudo'] || row['video'] || row['conteudo'] || '',
        titulo: row['titulo do video'] || '',
        horario_publicacao: row['horario de publicacao'] || row['horario de publicacao do video'] || '',
        // Debugging what we actually get
        _raw_horario: row['horario de publicacao do video'],
        _raw_id: row['conteudo']
    }));
};

const processed = processVideoData(data);
console.log("Processed Video Data:", processed);

const dateStr = processed[0].horario_publicacao;
console.log("Date String:", dateStr);
console.log("Parsed Date:", new Date(dateStr).toString());
