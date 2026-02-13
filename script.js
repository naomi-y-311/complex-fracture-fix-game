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
    name: "bone_0",
    type: 'bone',
    // ▼ Figmaのサイドバーの数値をそのまま書く
    targetX: 109, 
    targetY: 78,
    // ▼ Figmaからコピーした d="..." の中身
    pathData: "M24.3092 0.676627C25.3709 0.713609 51.097 -0.209172 51.0564 1.83097C50.7519 16.6205 48.222 31.2315 46.7241 45.9198C41.5036 97.1102 35.7412 148.984 35.9941 200.46C36.0185 205.424 35.6687 210.418 35.213 215.425C31.9988 219.356 28.3411 224.133 24.856 227.574C24.6866 227.741 24.3836 227.798 23.8635 227.662C23.3591 227.529 22.7718 227.244 22.177 226.92C21.6048 226.609 21.0006 226.247 20.5413 226.02C20.3099 225.906 20.0791 225.806 19.8771 225.761C19.7169 225.726 19.4172 225.691 19.2086 225.908L19.1681 225.955C18.6393 226.637 18.2968 227.27 18.03 227.785C17.7509 228.323 17.5831 228.667 17.3868 228.876C17.3003 228.968 17.2227 229.016 17.1434 229.039C17.062 229.063 16.946 229.071 16.7686 229.032C16.3964 228.95 15.8452 228.682 14.9781 228.124C14.3047 227.69 13.0476 226.976 11.5691 226.107C10.082 225.232 8.35349 224.19 6.70982 223.087C5.06352 221.982 3.51566 220.825 2.38335 219.72C1.8172 219.168 1.36461 218.638 1.0558 218.143C0.745237 217.646 0.596863 217.212 0.596863 216.843C0.596829 216.764 0.572506 216.691 0.531036 216.63C13.2572 151.738 5.41174 84.9607 14.4791 19.651C15.2826 13.5671 16.2622 7.8938 15.6831 1.70042C18.4245 1.22044 21.5022 0.578686 24.3092 0.676627Z", 
    color: "#ffcdd3",
    zIndex: 1
        },
        {
    name: "bone_1",
    type: 'bone',
    // ▼ Figmaのサイドバーの数値をそのまま書く
    targetX: 119.58, 
    targetY: 306.06,
    // ▼ Figmaからコピーした d="..." の中身
    pathData: "M4.24547 1.03198C4.89977 1.45308 5.42969 1.74799 5.87162 1.91676C5.70183 2.34414 5.48711 2.85141 5.32405 3.35463C5.14243 3.9152 5.0062 4.52609 5.05818 5.11758L5.0681 5.23195L5.14055 5.32132C5.21634 5.41503 5.34195 5.53708 5.44835 5.64308C5.56555 5.75986 5.68493 5.88159 5.7852 6.00311C5.88923 6.12922 5.95014 6.22862 5.97385 6.2973C5.97705 6.3066 5.97803 6.31435 5.97937 6.31973C5.92331 6.38462 5.81711 6.4825 5.5811 6.68085C5.33744 6.88562 4.96487 7.19132 4.42824 7.6458C3.33392 8.57258 1.66605 10.0788 0.641243 10.872C0.575468 10.9229 0.511708 10.9714 0.451118 11.018C1.03681 9.79263 1.70286 8.19063 2.2924 6.59444C2.74939 5.35709 3.16538 4.11077 3.4677 3.02919C3.70185 2.19144 3.8742 1.42876 3.93804 0.839661C4.05101 0.909027 4.15389 0.973044 4.24547 1.03198Z", 
    color: "#ffcdd3",
    zIndex: 1
        },
        {
    name: "bone_2",
    type: 'bone',
    // ▼ Figmaのサイドバーの数値をそのまま書く
    targetX: 106.68, 
    targetY: 301.92,
    // ▼ Figmaからコピーした d="..." の中身
    pathData: "M10.0324 0.576447C11.3539 1.42718 12.6812 2.22406 13.8528 2.91309C14.7572 3.44497 15.5619 3.91044 16.2027 4.28806C16.2 4.79593 16.0295 5.64858 15.7331 6.70889C15.4378 7.76521 15.0288 8.99115 14.5765 10.2157C13.7666 12.4086 12.831 14.5585 12.1767 15.7152C8.51553 13.4505 4.71336 11.7934 0.539879 10.4569C0.639871 9.50819 0.740009 8.5612 0.842161 7.61758C0.866354 7.60057 0.889501 7.58091 0.909826 7.55765C1.16608 7.26423 1.76513 6.72231 2.57054 6.04807C3.368 5.38049 4.34699 4.5999 5.34478 3.83501C6.34265 3.07006 7.35712 2.32278 8.22566 1.72086C8.99335 1.18884 9.62697 0.784436 10.0324 0.576447Z",
    color: "#ffcdd3",
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
                ctx.fillStyle = p.isLocked ? "#ffe0b2" : p.color;
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
