// =================================================================
//  bracket-draw.js — SVG connector lines for tournament bracket
//  ES5 — no external dependencies
//  Called by master.js via BracketDraw.init() after data render
// =================================================================

var BracketDraw = (function () {

    var STROKE       = 'rgba(251,191,36,0.75)';
    var STROKE_WIDTH = '2.5';

    // ------------------------------------------------------------------
    //  Connection table
    //  type 'merge'  : two source cards (a + b) merge → one target (t)
    //  type 'single' : one source (a) → one target (t)  [SF → Final]
    //
    //  side 'right'  : sources exit RIGHT edge, target enters LEFT edge
    //                  (left half — flows left to right toward center)
    //  side 'left'   : sources exit LEFT edge,  target enters RIGHT edge
    //                  (right half — flows right to left toward center)
    // ------------------------------------------------------------------
    var CONNECTIONS = [
        // ── Left half: R32 → R16 ──────────────────────────────────────
        { type: 'merge',  a: 'm-r32-l1', b: 'm-r32-l2', t: 'm-r16-l1', side: 'right' },
        { type: 'merge',  a: 'm-r32-l3', b: 'm-r32-l4', t: 'm-r16-l2', side: 'right' },
        { type: 'merge',  a: 'm-r32-l5', b: 'm-r32-l6', t: 'm-r16-l3', side: 'right' },
        { type: 'merge',  a: 'm-r32-l7', b: 'm-r32-l8', t: 'm-r16-l4', side: 'right' },
        // ── Left half: R16 → QF ───────────────────────────────────────
        { type: 'merge',  a: 'm-r16-l1', b: 'm-r16-l2', t: 'm-qf-l1',  side: 'right' },
        { type: 'merge',  a: 'm-r16-l3', b: 'm-r16-l4', t: 'm-qf-l2',  side: 'right' },
        // ── Left half: QF → SF ────────────────────────────────────────
        { type: 'merge',  a: 'm-qf-l1',  b: 'm-qf-l2',  t: 'm-sf-l',   side: 'right' },
        // ── Left half: SF → Final ─────────────────────────────────────
        // handled by drawSFCenter()

        // ── Right half: R32 → R16 ─────────────────────────────────────
        { type: 'merge',  a: 'm-r32-r1', b: 'm-r32-r2', t: 'm-r16-r1', side: 'left' },
        { type: 'merge',  a: 'm-r32-r3', b: 'm-r32-r4', t: 'm-r16-r2', side: 'left' },
        { type: 'merge',  a: 'm-r32-r5', b: 'm-r32-r6', t: 'm-r16-r3', side: 'left' },
        { type: 'merge',  a: 'm-r32-r7', b: 'm-r32-r8', t: 'm-r16-r4', side: 'left' },
        // ── Right half: R16 → QF ──────────────────────────────────────
        { type: 'merge',  a: 'm-r16-r1', b: 'm-r16-r2', t: 'm-qf-r1',  side: 'left' },
        { type: 'merge',  a: 'm-r16-r3', b: 'm-r16-r4', t: 'm-qf-r2',  side: 'left' },
        // ── Right half: QF → SF ───────────────────────────────────────
        { type: 'merge',  a: 'm-qf-r1',  b: 'm-qf-r2',  t: 'm-sf-r',   side: 'left' },
        // ── Right half: SF → Final ────────────────────────────────────
        // handled by drawSFCenter()
    ];

    // ------------------------------------------------------------------
    //  getRect — bounding box of an element relative to the container
    //  Returns null if element not found or not visible (display:none)
    // ------------------------------------------------------------------
    function getRect(id, container) {
        var el = document.getElementById(id);
        if (!el) return null;
        var elBox = el.getBoundingClientRect();
        // Element is hidden (display:none or inside hidden parent)
        if (elBox.width === 0 && elBox.height === 0) return null;
        var ctBox = container.getBoundingClientRect();
        return {
            left:    elBox.left   - ctBox.left,
            right:   elBox.right  - ctBox.left,
            top:     elBox.top    - ctBox.top,
            bottom:  elBox.bottom - ctBox.top,
            centerX: (elBox.left  + elBox.right)  / 2 - ctBox.left,
            centerY: elBox.top    - ctBox.top + elBox.height / 2
        };
    }

    // ------------------------------------------------------------------
    //  makeLine — creates one SVG <line> element
    // ------------------------------------------------------------------
    function makeLine(x1, y1, x2, y2) {
        var NS   = 'http://www.w3.org/2000/svg';
        var line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', Math.round(x1));
        line.setAttribute('y1', Math.round(y1));
        line.setAttribute('x2', Math.round(x2));
        line.setAttribute('y2', Math.round(y2));
        line.setAttribute('stroke',         STROKE);
        line.setAttribute('stroke-width',   STROKE_WIDTH);
        line.setAttribute('stroke-linecap', 'round');
        line.style.opacity    = '0';
        line.style.transition = 'opacity 0.5s ease';
        return line;
    }

    // ------------------------------------------------------------------
    //  drawMerge — 2 sources → 1 target
    //
    //  side='right' (left half):          side='left' (right half):
    //
    //    srcA ─────┐                              ┌───── srcA
    //              ├──── target      target ──────┤
    //    srcB ─────┘                              └───── srcB
    //
    //  4 lines:  H(A→mid), H(B→mid), V(A.cy→B.cy @ midX), H(mid→target)
    // ------------------------------------------------------------------
    function drawMerge(svg, container, conn) {
        var ra = getRect(conn.a, container);
        var rb = getRect(conn.b, container);
        var rt = getRect(conn.t, container);
        if (!ra || !rb || !rt) return;

        var exitX, entryX;
        if (conn.side === 'right') {
            exitX  = ra.right;   // both sources share the same right edge
            entryX = rt.left;
        } else {
            exitX  = ra.left;    // both sources share the same left edge
            entryX = rt.right;
        }

        var midX  = (exitX + entryX) / 2;
        var midCY = (ra.centerY + rb.centerY) / 2;

        svg.appendChild(makeLine(exitX, ra.centerY, midX,   ra.centerY)); // H: source A → midX
        svg.appendChild(makeLine(exitX, rb.centerY, midX,   rb.centerY)); // H: source B → midX
        svg.appendChild(makeLine(midX,  ra.centerY, midX,   rb.centerY)); // V: merge bar
        svg.appendChild(makeLine(midX,  midCY,      entryX, rt.centerY)); // H: midX → target
    }

    // ------------------------------------------------------------------
    //  drawSingle — 1 source → 1 target  (SF → Final)
    //  Elbow: H ─ V ─ H   (or straight if Y difference < 2px)
    // ------------------------------------------------------------------
    function drawSingle(svg, container, conn) {
        var ra = getRect(conn.a, container);
        var rt = getRect(conn.t, container);
        if (!ra || !rt) return;

        var exitX, entryX;
        if (conn.side === 'right') {
            exitX  = ra.right;
            entryX = rt.left;
        } else {
            exitX  = ra.left;
            entryX = rt.right;
        }

        // Straight line if already at the same height
        if (Math.abs(ra.centerY - rt.centerY) < 2) {
            svg.appendChild(makeLine(exitX, ra.centerY, entryX, rt.centerY));
            return;
        }

        var midX = (exitX + entryX) / 2;
        svg.appendChild(makeLine(exitX, ra.centerY, midX,   ra.centerY)); // H
        svg.appendChild(makeLine(midX,  ra.centerY, midX,   rt.centerY)); // V
        svg.appendChild(makeLine(midX,  rt.centerY, entryX, rt.centerY)); // H
    }

    // ------------------------------------------------------------------
    //  drawSFCenter — SF-L and SF-R connect to Final (bottom) and
    //  Bronze (top) via a shared vertical axis at centerX of Final card.
    //
    //  SF-L (left side)  ──────────────┐
    //                                  │ (vertical axis = Final.centerX)
    //  SF-R (right side) ──────────────┘
    //                                  │
    //                             Final (enters from bottom)
    //                                  │
    //                            Bronze (enters from top)
    // ------------------------------------------------------------------
    function drawSFCenter(svg, container) {
        var sfL    = getRect('m-sf-l',    container);
        var sfR    = getRect('m-sf-r',    container);
        var rFinal  = getRect('m-final',   container);
        var rBronze = getRect('m-bronze',  container);
        if (!sfL || !sfR || !rFinal || !rBronze) return;

        var cx = rFinal.centerX; // shared vertical axis

        // SF-L: horizontal line from right edge to center axis
        svg.appendChild(makeLine(sfL.right, sfL.centerY, cx, sfL.centerY));
        // SF-R: horizontal line from left edge to center axis
        svg.appendChild(makeLine(sfR.left,  sfR.centerY, cx, sfR.centerY));
        // Vertical: from SF-L height down to bottom of Final card
        svg.appendChild(makeLine(cx, sfL.centerY, cx, rFinal.bottom));
        // Vertical: from SF-R height up to top of Bronze card
        svg.appendChild(makeLine(cx, sfR.centerY, cx, rBronze.top));
    }

    // ------------------------------------------------------------------
    //  init — clears SVG and redraws all connectors
    //  Call this after the bracket cards are rendered in the DOM
    // ------------------------------------------------------------------
    function init() {
        var svg = document.getElementById('bracket-svg');
        if (!svg) return;

        var container = svg.parentNode; // .bracket-area

        // Clear previous lines
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        for (var i = 0; i < CONNECTIONS.length; i++) {
            var conn = CONNECTIONS[i];
            if (conn.type === 'merge') {
                drawMerge(svg, container, conn);
            } else {
                drawSingle(svg, container, conn);
            }
        }

        // SF → Final / Bronze central T-connection
        drawSFCenter(svg, container);
    }

    // ------------------------------------------------------------------
    //  animarLinhas — faz as linhas SVG aparecerem em cascata
    //  startDelay: ms a esperar antes de iniciar (sincroniza com cards)
    // ------------------------------------------------------------------
    function animarLinhasComDelay(line, delay) {
        setTimeout(function() {
            line.style.opacity = '1';
        }, delay);
    }

    function animarLinhas(startDelay) {
        var svg = document.getElementById('bracket-svg');
        if (!svg) return;
        var lines = svg.getElementsByTagName('line');
        for (var i = 0; i < lines.length; i++) {
            animarLinhasComDelay(lines[i], startDelay + i * 25);
        }
    }

    // Redraw on window resize (debounced)
    var _resizeTimer = null;
    function onResize() {
        if (_resizeTimer) clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(init, 150);
    }

    if (window.addEventListener) {
        window.addEventListener('resize', onResize);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', onResize);
    }

    return { init: init, animarLinhas: animarLinhas };

}());
