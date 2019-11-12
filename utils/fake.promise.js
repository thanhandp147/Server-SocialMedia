const fakePromise = item => new Promise(resolve => {
    setTimeout(function(){
        resolve(item)
    }, 1000);
});

const arrFake = [1, 2, 3];
const arrPromise = [];
for (let index = 0; index < arrFake.length; index++) {
    arrPromise.push(fakePromise(arrFake[index]));
}

(async function(){
    const [a, b, c] = await Promise.all(arrPromise);
    console.log({ a, b, c })
})()