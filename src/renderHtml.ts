export function renderHtml(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Echo URL</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
        <style>
          /* Toast 样式 */
          .toast {
            visibility: hidden;
            min-width: 250px;
            margin-left: -125px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 2px;
            padding: 16px;
            position: fixed;
            z-index: 1;
            left: 50%;
            top: 10px;
            font-size: 17px;
            opacity: 0;
            transition: opacity 0.5s, visibility 0.5s;
          }

          .toast.show {
            visibility: visible;
            opacity: 1;
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"></script>

      </head>
    
      <body>
        <header>
          <h1>Echo URL</h1>
            <!-- 输出链接的 p 标签 -->
          <p id="output">
            <!-- 拼接出来的 URL 会显示在这里 -->
            <a href="#" id="linkOutput" target="_blank">http://yourserver.com/encodedData</a>
            <!-- 剪贴板图标 -->
            <span id="copyIcon" style="cursor: pointer; margin-left: 10px;">&#128203;</span>
          </p>
          <!-- Toast 提示 -->
          <div id="toast" class="toast">Copied.</div>

        </header>
        <main>
          <!-- 单选框选择 JSON 或 Plain Text -->
          <div>
            <label for="jsonOption">
              <input type="radio" id="jsonOption" name="displayOption" value="json" checked> JSON
            </label>
            <label for="plainOption">
              <input type="radio" id="plainOption" name="displayOption" value="plain"> Plain Text
            </label>
          </div>
          
          <!-- 错误提示 p 标签 -->
          <p id="error-message" style="color: red; display: none;">JSON format is incorrect.</p>

          <textarea id="myTextarea" style="width: 100%; height: 50vh; box-sizing: border-box; padding: 5px; text-align: left; line-height: 1.2; vertical-align: top;" oninput="updateTextByInput()"></textarea>
          <div style="position: relative; text-align: center; margin-top: 20px;">
            
          <p style="position: relative; bottom: 0; left: 50%; transform: translateX(-50%); padding: 10px; background: #f0f0f0; text-decoration: none;">
            Author: <a href="https://github.com/thesomeexp" >thesomeexp</a>
          </p>
         </div>
        </main>
        
        <script>

          // 服务器的基础地址
          const baseURL = window.location.origin + '/echo';

          function updateTextByInput() {
            console.log('updateTextByInput: ')
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
              try {
                // 尝试解析 textarea 内容
                textareaValue = JSON.stringify(JSON.parse(textareaValue));
                document.getElementById('error-message').style.display = 'none'; // 隐藏错误提示
              } catch (e) {
                console.log('e: ', e)
                isValidJSON = false; // 如果解析失败，标记为无效 JSON
                document.getElementById('error-message').style.display = 'block'; // 显示错误提示
              }
            } else {
              document.getElementById('error-message').style.display = 'none'; // 隐藏错误提示 
            }
            
            // 使用 LZString 进行压缩
            const compressedText = LZString.compressToEncodedURIComponent(textareaValue);
            // console.log('compressedText: ', compressedText)

            // 拼接成完整的 URL 地址
            const fullURL = baseURL + '/' + type + '/' + compressedText;
            
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
            const newURL = window.location.origin + '/edit/' + type + '/' + compressedText;

            // 使用 history.pushState 或 history.replaceState 更新浏览器的地址栏
            // history.replaceState(null, '', newURL); // 替换浏览器地址栏的 URL（不刷新页面）

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
      setTimeout(function() {
        toast.className = toast.className.replace('show', ''); // 5秒后隐藏
      }, 3000);
    }
      
    // 页面加载完成后执行 updateText()
    window.onload = function() {
      const url = new URL(window.location.href);
      // console.log('url: ', url)
      const path = url.pathname.slice(1); // 去掉开头的 "/"
      // 获取路径的前两个部分
      const segments = path.split('/'); // 分割路径
      const prefix = segments[0] || ''; // 获取第一个部分 "aaa"
      const type = segments[1] || '';   // 获取第二个部分 "type"
      const data = segments[2] || '';   // 获取第3个部分 "data"
      // console.log('segments: ', segments)
      
      if (type === 'json') {
        document.getElementById('jsonOption').checked = true; // 设置 jsonOption 为选中
      } else if (type === 'plain') {
        document.getElementById('plainOption').checked = true; // 设置 plainOption 为选中
      }
      
			switch (type) {
        case 'plain': {
          const dUri = decodeURIComponent(data)
          const text = LZString.decompressFromEncodedURIComponent(dUri);
          document.getElementById('myTextarea').value = text;
          break;
        }
        case 'json': {
          const dUri = decodeURIComponent(data)
          const text = LZString.decompressFromEncodedURIComponent(dUri);
          document.getElementById('myTextarea').value = JSON.stringify(JSON.parse(text), null, 2);
          break;
        }
		    default: {
        }
      }

      // 页面加载完成时执行一次更新函数
      updateText(); 
      
      // 监听单选框变化，更新显示内容
      const radioButtons = document.querySelectorAll('input[name="displayOption"]');
      radioButtons.forEach(radio => {
        radio.addEventListener('change', updateText); // 选中变化时执行 updateText
      });
    };
        </script>
      </body>
    </html>
`;
}
