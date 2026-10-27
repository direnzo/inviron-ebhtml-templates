var CONFIG = {
    timing: {
        fadeDuration: 150, pollMs: 2000, dataTimeoutMs: 8000,
        mediaTimeoutMs: 15000, mediaStallMs: 8000, maxAlertAgeMs: 90000,
        maxDataAgeMs: 120000,
        baseBetweenAlertsMs: 1500
    },
    dataset: { mode: 'mock' },
    mock: { scenario: 'demo', stepMs: 14000 },
    audio: { muted: true },
    teams: { left: { id: 'vasco', name: 'VASCO' }, right: { id: 'flamengo', name: 'FLAMENGO' } },
    colors: { text: '#000000', background: '#000000' },
    layout: {
        formats: {
            full: {
                width: 1920, height: 1080, fontVmin: 2.6,
                typography: { name: 1.28, score: 8.4, status: 1.2, clock: 2.8 },
                regions: {
                    'left-name': [341.4, 518.88, 275, 69.2], 'right-name': [961.09, 518.88, 275, 69.2],
                    'left-data': [341.4, 598.58, 275, 281], 'right-data': [961.09, 598.58, 275, 281],
                    'match-status': [677.66, 617.45, 225, 56], 'match-clock': [655.64, 685.6, 270, 158]
                },
                media: { base: 'full-base.mp4',
                    goal: { flamengo: 'full-goal-flamengo.mp4', vasco: 'full-goal-vasco.mp4' },
                    yellow: { flamengo: 'full-yellow-flamengo.mp4', vasco: 'full-yellow-vasco.mp4' },
                    red: { flamengo: 'full-red-flamengo.mp4', vasco: 'full-red-vasco.mp4' }
                }
            },
            strip: {
                width: 2048, height: 128, fontVmin: 12,
                typography: { name: 1.28, score: 4.5, status: 1.2, clock: 1.6 },
                regions: {
                    'left-data': [1316.62, 36.67, 116.07, 57.32], 'right-data': [1568.97, 36.67, 116.07, 57.32],
                    'match-clock': [1443.45, 45.41, 115.69, 43.69]
                },
                media: { base: 'strip-base.mp4',
                    goal: { flamengo: 'strip-goal-flamengo.mp4', vasco: 'strip-goal-vasco.mp4' },
                    yellow: { flamengo: 'strip-yellow-flamengo.mp4', vasco: 'strip-yellow-vasco.mp4' },
                    red: { flamengo: 'strip-red-flamengo.mp4', vasco: 'strip-red-vasco.mp4' }
                }
            }
        }
    },
    mediaPrefix: 'videos/runtime/'
};

function aplicarConfigVisual(formatName) {
    var format = CONFIG.layout.formats[formatName];
    var root = document.documentElement.style;
    root.setProperty('--cor-texto', CONFIG.colors.text);
    root.setProperty('--cor-fundo', CONFIG.colors.background);
    document.body.style.fontSize = format.fontVmin + 'vmin';
    document.getElementById('stage').className = formatName;
    var regions = document.querySelectorAll('.region');
    for (var index = 0; index < regions.length; index++) {
        var element = regions[index];
        var box = format.regions[element.id];
        element.style.display = box ? '' : 'none';
        if (box) {
            element.style.left = (box[0] / format.width * 100) + '%';
            element.style.top = (box[1] / format.height * 100) + '%';
            element.style.width = (box[2] / format.width * 100) + '%';
            element.style.height = (box[3] / format.height * 100) + '%';
        }
    }
    document.getElementById('scoreboard').style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
}