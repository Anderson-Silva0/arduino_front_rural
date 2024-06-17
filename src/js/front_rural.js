let chartInstance;
let listaTop5 = [];
const container = document.getElementById("div_container");
const alarmAudio = document.getElementById('alarmAudio');
const presencaCount = document.getElementById('presencaCount');
const divTop5 = document.getElementById("div_top5");
const bodyTable = document.getElementById("table_body");

setInterval(function () {
    getAllData();
    getQtdPresencas();
}, 1500);

function getAllData() {
    const response = fetch('http://localhost:8080/obterDadosArduino')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            updateChart(data);
        })
}

function getQtdPresencas() {
    fetch('http://localhost:8080/obterDadosArduino/dataDuracaoPresencas')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const qtdPresencas = data.length;
            presencaCount.innerHTML = qtdPresencas;
            if (qtdPresencas >= 5) {
                listaTop5 = getTop5Presencas(data);
                renderTop5(listaTop5);
            } else {
                divTop5.className = "top5_presenca_none";
            }
        })
}

function renderTop5(listaTop5) {
    divTop5.className = "top5_presenca";

    if (bodyTable.hasChildNodes()) {
        while (bodyTable.firstChild) {
            bodyTable.removeChild(bodyTable.firstChild);
        }
    }

    for (let i = 0; i < listaTop5.length; i++) {
        const dataDuracao = listaTop5[i];

        const tr = document.createElement("tr");

        const dataHoraTd = document.createElement("td");
        dataHoraTd.innerHTML = dataDuracao.dataHora;

        const duracaoTd = document.createElement("td");
        duracaoTd.innerHTML = formatTime(dataDuracao.duracao);

        tr.appendChild(dataHoraTd);
        tr.appendChild(duracaoTd);
        bodyTable.appendChild(tr);
    }
}

function getTop5Presencas(listaPresenca) {
    const top5 = listaPresenca.slice(-5);
    top5.reverse();

    return top5;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function updateChart(response) {
    if (!response) return;

    const labels = response.map(item => item.dataHora);
    const valores = response.map(item => item.valor);

    if (!chartInstance) {
        chartInstance = new Chart($("#lineChartID"), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sinal Ativo',
                    data: valores,
                    borderColor: 'red',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 3,
                    pointBackgroundColor: '#FFFFFF'
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 20,
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    y: {
                        min: 0,
                        max: 1,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                }
            }
        });
    } else {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = valores;
        chartInstance.update();

        if (valores[valores.length - 1] > 0) {
            alarmAudio.play();
            container.classList.add('alerta');
        } else {
            container.classList.remove('alerta');
        }
    }
}