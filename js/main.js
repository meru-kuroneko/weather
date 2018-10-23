var app = new Vue({
    el: '#app',
    data: json,
    methods: {
        handleClick: function (event) {
            alert(event.target)
        },
        flowerClick: function (event) {
            alert(app.message)
        },
        // ボタンをクリックしたときのハンドラ
        increment: function () {
            this.count += 1 // 処理は再代入するだけでOK！
        }
    }
})

