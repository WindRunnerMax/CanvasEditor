# CanvasEditor

<p>
<a href="https://github.com/WindrunnerMax/CanvasEditor">GitHub</a>
<span>｜</span>
<a href="https://windrunnermax.github.io/CanvasEditor/">DEMO</a>
<span>｜</span>
<a href="https://github.com/WindrunnerMax/CanvasEditor/issues/2">BLOG</a>
<span>｜</span>
<a href="./NOTE.md">NOTE</a>
<span>｜</span>
<a href="./TODO.md">TODO</a>
</p>

基于`Canvas`实现的的简历编辑器。


```bash
$ npm i -g pnpm
$ pnpm install
$ npm run dev:react
```

## FAQ

为什么要自行实现一个简历编辑器：

1. 固定模版不好用，各种模版用起来细节上并不是很满意，要么是模块的位置固定，要么是页面边距不满意，而通过`Canvas`实现的简历编辑器都是图形，完全依靠画布绘制图形，在给定的基础图形上可以任意绘制，不会有排版问题。
2. 数据安全不能保证，因为简历上通常会存在很多个人信息，例如电话、邮箱等等，这些简历网站通常都需要登录才能用，数据都存在服务端，虽然泄漏的可能性不大，但是保护隐私还是很重要的，此编辑器是纯前端项目，数据全部存储在本地，没有任何服务器上传行为，可以完全保证数据安全。
3. 维持一页简历不易，之前使用某简历模版网站时，某一项写的字较多时导出就会出现多页的情况，而我们大家大概都听说过简历最好是一页，所以在实现此编辑器时是直接通过排版的方式生成`PDF` ，所以在设置页面大小后，导出的`PDF`总会是保持一页，看起来会更美观。

