const Solution = require('./src/solution');

//Application Bootstrap
(async () => {
    await Solution.fetchText();
    Solution.getSolution().then((data)=>{
        console.log(data);
    })
    console.log("ok")
})();



