
// 服务器的基础地址
const baseURL = window.location.origin + '/echo?';

function updateTextByInput() {
    updateText()
}
// 定义更新内容并回显的函数
function updateText() {
    // 获取 textarea 中的内容
    var textareaValue = document.getElementById('myTextarea').value;
    // console.log('textareaValue: ', textareaValue)
    // 获取选择的单选框值
    const type = document.querySelector('input[name="displayOption"]:checked').value;
    // console.log('type: ', type)
    if (type === 'json') {
        // 校验是否为有效的 JSON
        let isValidJSON = true;
        if (textareaValue.trim()) {
            try {
                // 尝试解析 textarea 内容
                textareaValue = JSON.stringify(JSON.parse(textareaValue));
                document.getElementById('error-message').style.display = 'none'; // 隐藏错误提示
            } catch (e) {
                // console.log('e: ', e)
                isValidJSON = false; // 如果解析失败，标记为无效 JSON
                document.getElementById('error-message').style.display = 'block'; // 显示错误提示
            }
        } else {
            document.getElementById('error-message').style.display = 'none'; // 隐藏错误提示 
        }
    } else {
        document.getElementById('error-message').style.display = 'none'; // 隐藏错误提示 
    }

    // 使用 LZString 进行压缩
    const compressedText = textareaValue ? LZString.compressToEncodedURIComponent(textareaValue) : '';

    // 拼接成完整的 URL 地址
    const fullURL = baseURL + type + compressedText;

    // 更新 p 标签的文本内容
    const outputLink = document.getElementById('linkOutput');
    if (outputLink) {
        outputLink.href = fullURL; // 设置链接的 href 属性
        outputLink.textContent = fullURL; // 设置链接文本
    }

    // 更新剪贴板图标的点击事件
    const copyIcon = document.getElementById('copyIcon');
    if (copyIcon) {
        copyIcon.addEventListener('click', () => {
            // 使用 Clipboard API 将链接复制到剪贴板
            navigator.clipboard.writeText(fullURL).then(() => {
                // 显示成功提示
                showToast()
            }).catch(err => {
                console.error('复制失败:', err);
            });
        });
    }

    // 构造新的 URL，根据 type 设置新的参数
    const newURL = window.location.origin + '/edit?' + type + compressedText;

    // 使用 history.pushState 或 history.replaceState 更新浏览器的地址栏
    // 注: Chrome 可能会请求刷新页面, 导致触发 Worker
    history.replaceState(null, '', newURL); // 替换浏览器地址栏的 URL（不刷新页面）

}

// 复制地址到剪贴板的函数
function copyToClipboard(event) {
    event.preventDefault(); // 阻止链接的默认点击行为

    // 获取 p 标签的文本内容
    const textToCopy = document.getElementById('output').textContent;

    // 使用 Clipboard API 复制地址到剪贴板
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(); // 显示 Toast 提示
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

// 显示 Toast 提示
function showToast() {
    const toast = document.getElementById('toast');
    toast.className = 'toast show'; // 添加 "show" 类来展示 Toast
    setTimeout(function () {
        toast.className = toast.className.replace('show', ''); // 5秒后隐藏
    }, 3000);
}

// 页面加载完成后执行 updateText()
window.onload = function () {
    const url = window.location.href;
    let data = url.split('?')[1] || '';
    let type = 'json';
    if (data.startsWith('plain')) {
        type = 'plain'
        document.getElementById('plainOption').checked = true; // 设置 plainOption 为选中
    } else {
        document.getElementById('jsonOption').checked = true; // 设置 jsonOption 为选中
    }
    data = data.slice(type.length); 
    document.getElementById('myTextarea').value = LZString.decompressFromEncodedURIComponent(data)
    // 页面加载完成时执行一次更新函数
    updateText();

    // 监听单选框变化，更新显示内容
    const radioButtons = document.querySelectorAll('input[name="displayOption"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateText); // 选中变化时执行 updateText
    });
};