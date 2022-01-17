console.log(1);

function func() {
  console.info(2);
}

export default class Class {
  say() {
    console.debug(3);
    console.log('测试commit');
  }

  render() {
    return <div>{console.error(4)}</div>;
  }
}
