const jobData = {
    "脚本家": {
        fear: 3,
        description: "自分が判定に失敗した場合も修正内容が正しいものとして話を進める（恐怖耐久値は減少する）"
    },
    "霊媒師": {
        fear: 4,
        description: "誰かの恐怖耐久値が減る時、代わりに自分の恐怖耐久値を減らすことが出来る。"
    },
    "編集者": {
        fear: 3,
        description: "自分が判定に失敗した時、GMはランダムにキーワードを1つ公表する。"
    },
    "科学者": {
        fear: 2,
        description: "一度の判定で同時に2つまで修正点を指摘できる。"
    },
    "呪術師": {
        fear: 6,
        description: "自分が判定に成功した時、出た目の数字を選択してるPCの恐怖耐久度を1減らす。"
    },
    "無職": {
        fear: 5,
        description: "あらゆるロールプレイ時、皆から「お前、むーしょくっ！」といじられる。"
    }
};

let generatedJson = '';
const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    // アコーディオン開閉
    document.querySelector(".accordion-header")?.addEventListener("click", (e) => {
        e.currentTarget.closest(".accordion")?.classList.toggle("open");
    });

    // 職業変更イベント
    $("job").addEventListener("change", ({ target }) => {
        const { value: job } = target;
        const info = jobData[job];
        if (!info) return;

        $("job-fear").textContent = `恐怖耐久値: ${info.fear}`;
        $("job-description").textContent = info.description;
        $(".accordion")?.classList.add("open");
        target.classList.add("selected");
        showToast(`✔ 職業「${job}」が選択されました`);
    });

    // ランダム値生成
    $("randomBtn").addEventListener("click", () => {
        $("judgementValue").value = Math.floor(Math.random() * 6) + 1;
        showToast("✔ ランダムな値をセットしました");
    });

    // JSON生成
    $("generateBtn").addEventListener("click", outputJSON);

    // クリップボードへコピー
    $("copyBtn").addEventListener("click", () => {
        if (!generatedJson) {
            showToast("⚠ 先にJSONを生成してください", true);
            return;
        }
        navigator.clipboard.writeText(generatedJson)
            .then(() => showToast("✔ コピーしました"))
            .catch(err => showToast(`⚠ コピーに失敗：${err}`, true));
    });
});

function showToast(message, isError = false) {
    const toast = document.querySelector(".toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show", "error"), 2000);
}

function syntaxHighlight(json) {
    const escapeHTML = (str) =>
        str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    return escapeHTML(json).replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            let cls = "number";
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? "key" : "string";
            } else if (/true|false/.test(match)) {
                cls = "boolean";
            } else if (/null/.test(match)) {
                cls = "null";
            }
            return `<span class="json-${cls}">${match}</span>`;
        }
    );
}

function outputJSON() {
    const name = $("name").value.trim();
    const val = parseInt($("judgementValue").value);
    const job = $("job").value;

    if (!name || !job || isNaN(val)) {
        showToast("⚠ すべての項目を入力してください", true);
        return;
    }

    const { fear, description } = jobData[job];

    const data = {
        kind: "character",
        data: {
            name,
            memo: `職業: ${job}\n${description}`,
            params: [{ label: "判定値", value: `${val}` }],
            status: [{ label: "恐怖耐久値", value: fear, max: fear }],
            commands: "1D6<>{判定値}\n:恐怖耐久値-1"
        }
    };

    generatedJson = JSON.stringify(data, null, 2);
    $("output").innerHTML = syntaxHighlight(generatedJson);
    document.querySelector(".json-section")?.classList.add("json-visible");

    showToast("✔ CCFOLIA駒データを出力しました");
}


document.addEventListener("DOMContentLoaded", () => {
    const characterTool = $("characterTool");
    const replaceTool = $("replaceTool");
    const originalText = $("originalText");
    const toggleBtn = $("toggleToolBtn");
    const toolTitle = $("toolTitle");
    const replacedText = $("replacedText");
    const wordList = $("wordList");
    const toggleViewBtn = $("toggleViewBtn");

    const addWordRowBtn = $("addWordRow");
    const removeWordRowBtn = $("removeWordRow");
    const saveWordListToFileBtn = $("saveWordListToFile");
    const loadWordListFromFileInput = $("loadWordListFromFile");
    const triggerLoadFileBtn = $("triggerLoadFile");
    const updateReplaceBtn = $('updateReplaceBtn');
    const fileNameInput = $("fileNameInput");


    saveWordListToFileBtn.addEventListener("click", () => {
        let fileName = fileNameInput.value.trim();

        if (!fileName) {
            showToast("⚠ ファイル名を入力してください", true)
            fileNameInput.focus();
            return;
        }

        // 拡張子が付いてなければ .json を付ける
        if (!fileName.toLowerCase().endsWith(".json")) {
            fileName += ".json";
        }

        const wordData = Array.from(wordList.children).map(row => {
            const beforeWord = row.querySelector(".before-word").value;
            const afterWord = row.querySelector(".after-word").value;
            if (!beforeWord && !afterWord) {
                return
            }
            
            return {
                before: beforeWord || "",
                after: afterWord || ""
            };
        });

        const dataToSave = {
            originalText: originalText.value,
            wordList: wordData
        };

        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    });


    loadWordListFromFileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.wordList || !Array.isArray(data.wordList)) {
                    throw new Error("形式が不正です（wordListが存在しません）");
                }

                // 置換前テキストをセット
                originalText.value = data.originalText || "";

                // 単語リストを更新
                wordList.innerHTML = "";

                data.wordList.forEach((item, index) => {
                    if (item.before || item.after) {
                        const row = createWordRow(index);
                        row.querySelector(".before-word").value = item.before;
                        row.querySelector(".after-word").value = item.after;
                        wordList.appendChild(row);
                    }
                });

                updateRowNumbers();
                fileNameInput.value = file.name.replace('.json','');

                showToast("✔ ファイルを読み込みました。");
            } catch (err) {
                showToast("⚠ 読み込みエラー: " + err.message, true);
            }
        };
        reader.readAsText(file);
    });



    // ボタンからinput[type="file"]をトリガー
    triggerLoadFileBtn.addEventListener("click", () => {
        loadWordListFromFileInput.value = ''; // ← これで再選択を可能に
        loadWordListFromFileInput.click();
    });


    function scrollBottom() {
        wordList.scrollTop = wordList.scrollHeight
    }

    addWordRowBtn.addEventListener("click", () => {
        const newRow = createWordRow();
        wordList.appendChild(newRow);
        updateRowNumbers();
        scrollBottom();
    });

    removeWordRowBtn.addEventListener("click", () => {
        if (wordList.children.length > 1) {
            wordList.lastElementChild.remove();
            updateRowNumbers();
            scrollBottom();
        }
    });


    toggleBtn.addEventListener("click", () => {
        if (toolTitle.textContent === "怪談白物語キャラシツール") {
            toolTitle.textContent = "単語置換補助ツール";
            toggleBtn.textContent = "📃 キャラシツールへ切替";
        } else {
            toolTitle.textContent = "怪談白物語キャラシツール";
            toggleBtn.textContent = "⚙ GM用画面へ切替";
        }
        const showReplaceTool = replaceTool.style.display === "none";
        replaceTool.style.display = showReplaceTool ? "block" : "none";
        characterTool.style.display = showReplaceTool ? "none" : "block";
    });


    // 単語入力行を作成する関数
    function createWordRow(index = null) {
        const row = document.createElement("div");
        row.className = "word-row";

        const rowNumber = document.createElement("span");
        rowNumber.className = "row-number";
        rowNumber.textContent = index !== null ? index + 1 : wordList.children.length + 1;

        const beforeInput = document.createElement("input");
        beforeInput.type = "text";
        beforeInput.className = "before-word";
        beforeInput.placeholder = "置換前";

        const afterInput = document.createElement("input");
        afterInput.type = "text";
        afterInput.className = "after-word";
        afterInput.placeholder = "置換後";

        row.appendChild(rowNumber);
        row.appendChild(beforeInput);
        row.appendChild(afterInput);

        return row;
    }

    // 行番号の更新
    function updateRowNumbers() {
        Array.from(wordList.children).forEach((row, index) => {
            row.querySelector(".row-number").textContent = index + 1;
        });
    }


    // 初期状態で10行追加
    for (let i = 0; i < 10; i++) {
        const row = createWordRow(i);
        wordList.appendChild(row);
    }

    function applyReplacementsWithHighlight() {
        const original = document.getElementById('originalText').value;
        const rows = document.querySelectorAll('.word-row');

        let replaced = original;

        rows.forEach(row => {
            const from = row.querySelector('.before-word').value;
            const to = row.querySelector('.after-word').value;
            if (from && to) {
                const regex = new RegExp(escapeRegExp(from), 'g');
                // 強調タグで囲む
                const highlighted = `<mark>${to}</mark>`;
                replaced = replaced.replace(regex, highlighted);
            }
        });

        document.getElementById('replacedText').innerHTML = replaced;
    }

    // 特殊文字を正しくエスケープ（正規表現用）
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replaceText() {
        // 置換処理をしてから切り替える
        const text = originalText.value;
        const rows = document.querySelectorAll(".word-row");
        let replaced = text;

        rows.forEach(row => {
            const before = row.querySelector(".before-word")?.value;
            const after = row.querySelector(".after-word")?.value;
            if (before && after) {
                const regex = new RegExp(before, 'g');
                replaced = replaced.replace(regex, after);
            }
        });
        applyReplacementsWithHighlight();
        replacedText.value = replaced;
    }


    toggleViewBtn.addEventListener("click", () => {
        const isShowingOriginal = !originalText.classList.contains("hidden");

        if (isShowingOriginal) {
            // 置換処理をしてから切り替える
            replaceText()
            originalText.classList.add("hidden");
            replacedText.classList.remove("hidden");
            toggleViewBtn.textContent = "置換前を表示";
            updateReplaceBtn.style.display = 'block';
        } else {
            replacedText.classList.add("hidden");
            originalText.classList.remove("hidden");
            toggleViewBtn.textContent = "置換後を表示";
            updateReplaceBtn.style.display = 'none';
        }
    });

    updateReplaceBtn.addEventListener('click', () => {
        replaceText();
        showToast("✔ 更新しました");
    })
});





