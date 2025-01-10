(function () {
  const _root = document.querySelector('#root');
  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
      <style>
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #fff; /* 白色背景 */
        }

        #root {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          text-align: center;
          height: 100%;
        }

        #loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #fff; /* 白色背景 */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2; /* 确保加载动画在最前面 */
        }

        #loading-center-absolute {
          position: absolute;
          left: 50%;
          top: 50%;
          height: 120px; /* 缩小物体尺寸 */
          width: 120px;
          margin-top: -60px;
          margin-left: -60px;
        }

        #object {
          width: 60px;
          height: 60px;
          background-color: #888; /* 灰色物体 */
          margin-right: auto;
          margin-left: auto;
          animation: animate 1s infinite ease-in-out;
        }

        @keyframes animate {
          0% {
            transform: perspective(160px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: perspective(160px) rotateX(-180deg) rotateY(0deg);
          }
          100% {
            transform: perspective(160px) rotateX(-180deg) rotateY(-180deg);
          }
        }

        .loading-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333; /* 标题颜色设为深灰色 */
          margin-top: 120px; /* 文字距离物体稍微下移 */
          z-index: 3; /* 确保文字位于加载动画之上 */
          opacity: 0;
          animation: fadeInTitle 1.5s ease-out forwards; /* 文字渐现 */
        }

        .loading-sub-title {
          font-size: 1rem;
          color: #888; /* 子标题颜色设为灰色 */
          margin-top: 10px;
          opacity: 0;
          animation: fadeInSubTitle 0.5s ease-out forwards; /* 文字渐现 */
        }

        @keyframes fadeInTitle {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInSubTitle {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

      </style>

      <div id="loading">
        <div id="loading-center">
          <div id="loading-center-absolute">
            <div id="object"></div>
          </div>
        </div>
      </div>
      <div class="loading-title">
        正在加载资源...
      </div>
      <div class="loading-sub-title">
        初次加载可能需要一些时间，请耐心等待
      </div>
    `;
  }
})();
