const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const statusDiv = document.getElementById('status');
    const title = document.getElementById('title');
    const body = document.body;

    // --- ゲーム設定 ---
    const baseWidth = 400;
    const baseHeight = 600;
    let scale = 1;
    const snapDistance = 30; // 吸着距離

    // --- ピース定義 ---
    const piecesDef = [
        {
            name: "脛骨 (太い骨)",
            type: 'bone',
            targetX: 230, targetY: 200,
            path: [-40, -150, 40, -150, 50, 120, 10, 150, -30, 130, -40, -150],
            color: "#fff3e0",
            zIndex: 1
        },
        {
            name: "腓骨上部 (細い骨・上)",
            type: 'bone',
            targetX: 150, targetY: 165,
            path: [-15, -115, 15, -115, 18, 65, 5, 55, -5, 70, -15, -115],
            color: "#ffe0b2",
            zIndex: 1
        },
        {
            name: "腓骨下部 (外くるぶし)",
            type: 'bone',
            targetX: 155, targetY: 300,
            path: [ -5, -65, 5, -80, 18, -70, 20, 40, -10, 50, -25, -40, -5, -65],
            color: "#ffccbc",
            zIndex: 1
        },
        {
            name: "距骨 (関節部)",
            type: 'bone',
            targetX: 200, targetY: 365,
            path: [-45, -15, 45, -15, 55, 25, -35, 35, -45, -15],
            color: "#ffe0b2",
            zIndex: 1
        },
        {
            name: "踵骨 (かかと)",
            type: 'bone',
            targetX: 205, targetY: 425,
            path: [-40, -25, 50, -15, 70, 35, -20, 45, -60, 15, -40, -25],
            color: "#ffccbc",
            zIndex: 1
        },
        {
            name: "固定用プレート",
            type: 'plate',
            targetX: 158, targetY: 235,
            path: [-10, -70, 10, -70, 12, 80, -8, 80, -10, -70],
            screws: [
                {x: 0, y: -50, r: 3}, {x: 1, y: -20, r: 3}, 
                {x: 1, y: 20, r: 3}, {x: 2, y: 50, r: 3}
            ],
            color: "#cfd8dc",
            strokeColor: "#78909c",
            zIndex: 2
        }
    ];

    let pieces = [];
    let isDragging = false;
    let selectedPiece = null;
    let dragOffset = {x: 0, y: 0};
    let isCompleted = false;

    // --- ヘルパー関数 ---
    function buildPath(c, pathData) {
        c.beginPath();
        if (pathData.length < 2) return;
        c.moveTo(pathData[0], pathData[1]);
        for(let i=2; i<pathData.length; i+=2) {
            c.lineTo(pathData[i], pathData[i+1]);
        }
        c.closePath();
    }

    function drawCircle(c, x, y, r) {
        c.moveTo(x + r, y);
        c.arc(x, y, r, 0, Math.PI * 2);
    }

    // --- 初期化 ---
    function init() {
        // 修正点: まずピースを生成する
        pieces = piecesDef.map((def, index) => {
            // 初期位置をランダムに
            let startX, startY;
            if (index % 2 === 0) {
                startX = 50 + Math.random() * 50;
            } else {
                startX = baseWidth - 100 + Math.random() * 50;
            }
            startY = 50 + Math.random() * (baseHeight - 100);

            return {
                ...def,
                x: startX,
                y: startY,
                isLocked: false,
                id: index
            };
        });

        // その後にリサイズ（描画）を行う
        window.addEventListener('resize', resize);
        resize();
        
        statusDiv.textContent = "バラバラの骨をドラッグして整復してください";
    }

    function resize() {
        const winW = window.innerWidth * 0.95;
        const winH = window.innerHeight * 0.8;
        scale = Math.min(winW / baseWidth, winH / baseHeight);
        
        canvas.width = baseWidth * scale;
        canvas.height = baseHeight * scale;
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(scale, scale);
        
        draw();
    }

    // --- 描画ロジック ---
    function drawPiecePath(c, p) {
        if (p.type === 'plate') {
            c.beginPath();
            if (p.path.length >= 2) {
                c.moveTo(p.path[0], p.path[1]);
                for(let i=2; i<p.path.length; i+=2) c.lineTo(p.path[i], p.path[i+1]);
            }
            c.closePath();
            
            if (p.screws) {
                p.screws.forEach(s => drawCircle(c, s.x, s.y, s.r));
            }
        } else {
            buildPath(c, p.path);
        }
    }

    function draw() {
        if (!pieces || pieces.length === 0) return; // 安全策

        ctx.clearRect(0, 0, baseWidth, baseHeight);

        // 1. ガイドライン
        ctx.save();
        ctx.setLineDash([4, 4]);
        pieces.forEach(p => {
            if (!p.isLocked) {
                ctx.save();
                ctx.translate(p.targetX, p.targetY);
                drawPiecePath(ctx, p);
                ctx.strokeStyle = "#bdbdbd";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        });
        ctx.restore();

        // 2. ピース描画
        const sortedPieces = [...pieces].sort((a, b) => {
            if (a.isLocked !== b.isLocked) return a.isLocked ? -1 : 1;
            return a.zIndex - b.zIndex;
        });
        
        if (selectedPiece) {
            const idx = sortedPieces.indexOf(selectedPiece);
            if (idx > -1) {
                sortedPieces.splice(idx, 1);
                sortedPieces.push(selectedPiece);
            }
        }

        sortedPieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);

            if (p === selectedPiece && !p.isLocked) {
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;
            }

            drawPiecePath(ctx, p);

            if (p.type === 'plate') {
                ctx.fillStyle = p.isLocked ? "#b0bec5" : p.color;
                ctx.strokeStyle = p.strokeColor;
                ctx.fill("evenodd");
            } else {
                ctx.fillStyle = p.isLocked ? "#e0f7fa" : p.color;
                ctx.strokeStyle = "#5d4037";
                ctx.fill();
            }
            
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });

        updateProgress();
    }

    function updateProgress() {
        if (!pieces || pieces.length === 0) return;

        const bones = pieces.filter(p => p.type === 'bone');
        const plate = pieces.find(p => p.type === 'plate');
        
        if (!plate) return; // 安全策

        const lockedCount = bones.filter(p => p.isLocked).length;
        const totalBones = bones.length;
        
        let ratio = lockedCount / totalBones;
        if (plate.isLocked) ratio = 1.0;

        // 背景色変化
        const r = 255 - (31 * ratio);
        const g = 205 + (42 * ratio);
        const b = 210 + (40 * ratio);
        body.style.backgroundColor = `rgb(${r},${g},${b})`;

        const colorText = ratio > 0.8 ? "#006064" : "#b71c1c";
        title.style.color = colorText;
        statusDiv.style.color = colorText;

        if (lockedCount < totalBones) {
            statusDiv.textContent = `骨を整復してください (${lockedCount}/${totalBones})`;
        } else if (!plate.isLocked) {
            statusDiv.textContent = "仕上げにプレートで固定してください！";
        } else if (!isCompleted) {
            isCompleted = true;
            statusDiv.textContent = "手術成功！お大事にしてください！🎉";
            if(navigator.vibrate) navigator.vibrate([100,50,200]);
        }
    }

    // --- 入力イベント ---
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (cx - rect.left) / scale,
            y: (cy - rect.top) / scale
        };
    }

    function isInside(pos, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        drawPiecePath(ctx, p);
        const hit = ctx.isPointInPath(pos.x, pos.y);
        ctx.restore();
        return hit;
    }

    function handleStart(e) {
        if (isCompleted) return;
        e.preventDefault();
        const pos = getPos(e);

        const candidates = pieces.filter(p => !p.isLocked);
        for (let i = candidates.length - 1; i >= 0; i--) {
            if (isInside(pos, candidates[i])) {
                selectedPiece = candidates[i];
                isDragging = true;
                dragOffset.x = pos.x - candidates[i].x;
                dragOffset.y = pos.y - candidates[i].y;
                draw();
                return;
            }
        }
    }

    function handleMove(e) {
        if (!isDragging || !selectedPiece) return;
        e.preventDefault();
        const pos = getPos(e);
        selectedPiece.x = pos.x - dragOffset.x;
        selectedPiece.y = pos.y - dragOffset.y;
        draw();
    }

    function handleEnd(e) {
        if (!isDragging || !selectedPiece) return;
        e.preventDefault();

        const dx = selectedPiece.x - selectedPiece.targetX;
        const dy = selectedPiece.y - selectedPiece.targetY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < snapDistance) {
            const allBonesDone = pieces.filter(p => p.type === 'bone').every(p => p.isLocked);
            
            if (selectedPiece.type === 'plate' && !allBonesDone) {
                statusDiv.textContent = "先に骨をすべてくっつけてください！";
                if(navigator.vibrate) navigator.vibrate(100);
            } else {
                selectedPiece.x = selectedPiece.targetX;
                selectedPiece.y = selectedPiece.targetY;
                selectedPiece.isLocked = true;
                statusDiv.textContent = "カチッ！";
                if(navigator.vibrate) navigator.vibrate(50);
            }
        }

        isDragging = false;
        selectedPiece = null;
        draw();
    }

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart, {passive: false});
    canvas.addEventListener('touchmove', handleMove, {passive: false});
    canvas.addEventListener('touchend', handleEnd);

    // 実行開始
    init();
