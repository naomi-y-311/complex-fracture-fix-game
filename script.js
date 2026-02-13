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
    name: "新しい骨",
    type: 'bone',
    // ▼ Figmaのサイドバーの数値をそのまま書く
    targetX: 120, 
    targetY: 250,
    // ▼ Figmaからコピーした d="..." の中身
    pathData: "M133.541 0.780273C139 31.4544 169.597 112.938 136.834 135.277C125.9 142.733 108.786 156.408 83.5576 156.408C73.4748 156.408 59.5304 152.935 50.2734 158.315C42.6634 162.739 20.6579 174.854 13.5879 164.146C10.5237 159.504 11.7383 152.947 11.793 147.723C11.8934 138.102 5.06472 129.131 0.630859 121.017C17.5468 106.17 34.4314 91.2478 52.8877 78.3232C53.6574 77.7847 64.7129 72.3056 63.7246 69.5449C62.601 66.4089 49.4004 66.6008 47.2559 65.9111C59.3252 56.2131 72.3531 47.1022 85.6934 39.2461C88.4749 37.608 89.693 36.6962 90.1396 36.2793C91.8735 34.6589 87.2152 32.99 86.5498 32.6123C93.7306 25.1567 103.54 19.8115 112.181 14.2822C119.301 9.72612 126.188 4.90427 133.541 0.780273Z", 
    color: "#ffe0b2",
    zIndex: 1
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
            return null; // Path2Dオブジェクトではない
        } else if (p.pathData) {
            // ★追加: SVGデータ(pathData)がある場合の処理
            // 毎回生成すると重いので、初回だけ生成してキャッシュする
            if (!p.cachedPath) {
                p.cachedPath = new Path2D(p.pathData);
            }
            return p.cachedPath; // Path2Dオブジェクトを返す
        } else {
            // 従来の座標配列(path)の場合
            buildPath(c, p.path);
            return null;
        }
    }

/* drawPiecePath から返ってきたデータを使って、実際に色を塗る処理に変更 */
    function draw() {
        if (!pieces || pieces.length === 0) return;

        ctx.clearRect(0, 0, baseWidth, baseHeight);

        // 1. ガイドライン
        ctx.save();
        ctx.setLineDash([4, 4]);
        pieces.forEach(p => {
            if (!p.isLocked) {
                ctx.save();
                ctx.translate(p.targetX, p.targetY);
                
                const path2d = drawPiecePath(ctx, p); // パスを取得
                
                ctx.strokeStyle = "#bdbdbd";
                ctx.lineWidth = 2;
                
                // ★修正: Path2Dならそれを描画、違えば現在のパスを描画
                if (path2d) {
                    ctx.stroke(path2d);
                } else {
                    ctx.stroke();
                }
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

            const path2d = drawPiecePath(ctx, p); // パスを取得

            if (p.type === 'plate') {
                ctx.fillStyle = p.isLocked ? "#b0bec5" : p.color;
                ctx.strokeStyle = p.strokeColor;
                ctx.lineWidth = 2;
                // プレートは従来通り
                ctx.fill("evenodd");
                ctx.stroke();
            } else {
                ctx.fillStyle = p.isLocked ? "#e0f7fa" : p.color;
                ctx.strokeStyle = "#5d4037";
                ctx.lineWidth = 2;

                // ★修正: Path2Dと従来方式で塗り方を分ける
                if (path2d) {
                    ctx.fill(path2d);
                    ctx.stroke(path2d);
                } else {
                    ctx.fill();
                    ctx.stroke();
                }
            }
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

/* マウスが骨の上に乗ったかどうかの判定ロジックを、SVG対応版に変更 */
    function isInside(pos, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        const path2d = drawPiecePath(ctx, p);
        let hit = false;

        // ★修正: Path2Dがあるならそれを使って判定
        if (path2d) {
            // isPointInPath(path, x, y) は translate の影響を正しく受け取ります
            hit = ctx.isPointInPath(path2d, pos.x, pos.y);
        } else {
            // 従来方式（drawPiecePath内でパスが作られている）
            hit = ctx.isPointInPath(pos.x, pos.y);
        }
        
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
