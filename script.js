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
        },
        {
    name: "bone_3",
    type: 'bone',
    targetX: 107.11, 
    targetY: 295.7,
    pathData: "M2.55816 1.48712C2.61819 1.60241 2.68422 1.71737 2.75564 1.8317C3.10767 2.3952 3.60524 2.97217 4.19571 3.54831C5.37668 4.70059 6.96876 5.88799 8.62846 7.00177C8.74933 7.08288 8.87128 7.16299 8.99289 7.24338C8.5697 7.49099 8.04419 7.83547 7.47007 8.23334C6.58884 8.84405 5.56418 9.59922 4.55977 10.3692C3.55528 11.1392 2.56786 11.9266 1.76053 12.6025C1.3354 12.9584 0.954017 13.2887 0.644806 13.5715C1.02989 10.1272 1.47254 6.73939 2.14739 3.49794C2.28688 2.82794 2.42317 2.15753 2.55816 1.48712Z",
    color: "#ffcdd3",
    zIndex: 1
        },
        {
    name: "bone_4",
    type: 'bone',
    targetX: 119.09, 
    targetY: 294.27,
    pathData: "M25.6842 1.60074C25.379 4.834 25.0407 8.07185 24.738 11.3091C24.7226 11.3162 24.7077 11.3243 24.6935 11.3334C24.6987 11.3301 24.7034 11.3275 24.7034 11.3275L24.7067 11.3257C24.7015 11.3284 24.6914 11.3334 24.6755 11.3415C24.644 11.3573 24.5977 11.3804 24.5379 11.4102C24.4192 11.4694 24.2518 11.5533 24.0603 11.6511C23.679 11.8457 23.1943 12.1005 22.8015 12.3362C20.3663 13.7972 18.2884 15.9961 16.312 17.8884C15.9469 18.2378 15.7171 18.4532 15.5901 18.5757C15.5267 18.6368 15.4745 18.6887 15.4371 18.7312C15.4178 18.7532 15.3503 18.8268 15.3202 18.9353L15.3095 18.9842C15.2782 19.1949 15.3588 19.3723 15.4735 19.4991C15.5784 19.6149 15.7165 19.6958 15.8446 19.755C16.1023 19.8741 16.4447 19.9607 16.7801 20.033C16.9517 20.07 17.1302 20.105 17.3045 20.1389C17.48 20.1731 17.6513 20.2061 17.8145 20.2404C18.1492 20.3108 18.4164 20.3797 18.5879 20.4556C18.8352 20.5649 19.1137 20.5351 19.3366 20.485C19.5719 20.4321 19.8233 20.3376 20.0574 20.2404C20.2702 20.1521 20.5543 20.024 20.7362 19.9473C20.9512 19.8568 21.1159 19.7968 21.2312 19.7741C21.3017 19.7603 21.3975 19.7712 21.5298 19.833C21.663 19.8952 21.808 19.9974 21.9616 20.1279C22.114 20.2575 22.2606 20.4023 22.4021 20.5431C22.5353 20.6756 22.6786 20.8198 22.8022 20.9171L22.8077 20.9215L22.8136 20.9255C22.9601 21.0321 23.1016 21.1477 23.2545 21.2712C23.4044 21.3922 23.5644 21.5201 23.7337 21.6386C23.8086 21.691 23.8959 21.7125 23.9805 21.7055C23.9312 22.8319 23.8964 23.9577 23.8779 25.0825C22.9569 25.7854 21.7917 26.4933 20.5983 27.2099C19.3209 27.9769 18.0104 28.7552 16.9978 29.5281C16.5266 29.8877 16.1202 30.2108 15.7876 30.4783C15.684 30.3341 15.5363 30.1314 15.3235 29.8484C15.0043 29.4241 14.6701 28.9495 14.3162 28.4499C13.9638 27.9523 13.5933 27.4318 13.2075 26.9249C12.4394 25.9158 11.5907 24.9334 10.6657 24.2698C10.5346 24.1758 10.388 24.1627 10.2847 24.1672C10.1773 24.1718 10.068 24.1975 9.96695 24.2297C9.76373 24.2944 9.52658 24.4071 9.27817 24.5423C8.77738 24.8148 8.16472 25.2156 7.55972 25.6308C6.95334 26.0469 6.34069 26.4873 5.84274 26.8399C5.5925 27.0171 5.37186 27.1719 5.19294 27.2922C5.04008 27.395 4.93034 27.4628 4.86308 27.5C4.84065 27.4952 4.80414 27.4857 4.75165 27.464C4.61653 27.408 4.43247 27.3038 4.19195 27.1484C3.70938 26.8368 3.08835 26.3781 2.30654 25.8327C1.83477 25.5035 1.36108 25.1862 0.88559 24.8791C1.13297 24.7003 1.49661 24.4296 2.02338 24.0219C3.06321 23.2171 4.77932 21.6701 5.83649 20.7747C6.37545 20.3183 6.73156 20.0264 6.98714 19.8116C7.22905 19.6083 7.39609 19.4626 7.50382 19.3277C7.69441 19.0889 7.67917 18.8157 7.60716 18.6066C7.53911 18.409 7.40958 18.226 7.28759 18.0781C7.16176 17.9256 7.0193 17.7811 6.90146 17.6637C6.82666 17.5891 6.76758 17.5304 6.72274 17.4842C6.70992 17.0733 6.80728 16.6188 6.96214 16.1409C7.13055 15.6211 7.34705 15.1258 7.53655 14.6401C7.68042 14.6449 7.81908 14.6301 7.95247 14.5908C8.18828 14.5213 8.37595 14.3869 8.53166 14.2212C8.81993 13.9145 9.04672 13.439 9.29472 12.9603C9.54427 12.4785 9.84712 11.9223 10.3001 11.3242C10.3032 11.3248 10.3067 11.3253 10.3101 11.326C10.4188 11.3502 10.5819 11.4149 10.8036 11.5246C11.2509 11.7459 11.7917 12.073 12.4135 12.4112C13.0126 12.7371 13.6688 13.0618 14.2684 13.2195C14.8523 13.373 15.514 13.4007 15.9813 12.9393C19.2457 9.7161 22.6631 5.32997 25.6842 1.60074Z",
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
