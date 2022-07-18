---
title: 'Rust の BTreeMap(BTreeSet) のentryをいい感じに追加・変更・削除する方法 '
date: '2022-07-18'
description: 'Rust の BTreeMap(BTreeSet) のentryをいい感じに追加・変更・削除する方法 '
tags: ['競プロ','Rust']
---

## 競技プログラミングで競技中の人へ
本記事では、主にBTreeMapでのentryの操作(ループ内で他entryからvalueを引き継いで新たなentryの作成する方法など)をまとめた記事になります。
もしBTreeMap使っているがエラーが解消できない!!という状況であれば、一旦以下Replacing Procedureをコピペして読み解いていただけると解決の糸口が見えるかもしれません。引き続き頑張ってください。

ポイントは
* Rangeはkeyで指定する
* Someの中のkeyは参照を外してとる(つまり&keyなどと頭に&をつける)
* Someの中のvalueはアンスコ(\_)でとる
* valueはremoveで受け取る

です。
あとは`map.range(..(idx)).last()`に差し替えたりしながら活用してみてください。

```rust
fn main() {
    use std::collections::BTreeMap;
    let mut map = BTreeMap::<usize, Vec<i32>>::new();

    // Preparation
    for i in 1..=5 {
        let mut vec = vec![];
        for j in 1..=3 {
            vec.push((i * j) as i32);
        }
        map.insert(2 * i, vec);
    }

    // [Before] map: {2: [1, 2, 3], 4: [2, 4, 6], 6: [3, 6, 9], 8: [4, 8, 12], 10: [5, 10, 15]}
    // Replacing procedure
    for i in 1..=5 {
        let idx = 2 * i - 1;
        if let Some((&key, _)) = map.range((idx)..).next() {
            let val = map.remove(&key).unwrap();
            map.insert(idx, val);
        }
    }
    // [After] map {1: [1, 2, 3], 3: [2, 4, 6], 5: [3, 6, 9], 7: [4, 8, 12], 9: [5, 10, 15]}
}
```

## 本編
BTreeMapはkeyでentryがソートされている連想配列の一種です。C++で言えばSorted Map, Javaで言えばTreeMapあたりが対応するかなと思います。

本記事のモチベーションでもあるのですが、Rustの各種文法の厳しさから、Map内のentryの各種修正作業には考慮するべき事項がたくさんあります。特にループでそのような処理を考えるのは苦痛が伴います。(そのあたりの厳密さこそがRustの美点でもあるのですが...)

本記事を通して、コードベースで書き換えの苦について一緒に体感できたらと思います。


### 第一の方法 : Someで具体的なvalueを受けとる
最初の例ではアンスコ(\_)でSome内で受け取るvalueを指定する方法をみてみましたが、他の指定の仕方をするとどうなるでしょうか。まずは&valueとしてみましょう(` if let Some((&key, &value)) = map.range((idx)..).next()`)

残念ながらこちらはコンパイルエラーとなってしまいます。コンパイラが教えてくれる理由はVec\<i32\>にはCopy トレイトが実装されていないからというもの。

&をつけることでvalueはVec\<i32>型であると判断され、`map.range((idx)..).next()`の返り値と整合性を保つためにコピーセマンティックスが働くが、Vec\<i32>はCopyを実装していないのでコンパイルエラーが発生したというところでしょうか。

Copyトレイトが実装されているusize型などであればコピーして渡すので問題は起きないのですが、今回のようにVec\<hoge>のようなCopyトレイトが実装されていないデータは受け取れないのです。

この、&をつけるとムーブセマンティックスからコピーセマンティックスに変わるというのが重要な考え方だったりします。

### 第二の方法 : Someでvalueの参照を受けとる
次に&をつけるのではなく単にvalueとしてみましょう。こちらによって `if let`でコンパイルに怒られることはなくなりましたが、いざ `if let`内でmapのエントリーを操作しようとすると怒られちゃいます。
例えば以下のコードはコンパイルすることができません。

```rust
        if let Some((&key, value)) = map.range_mut((idx)..).next() {
            // The type of value is &mut Vec<i32>
            &value.push(4);
            map.insert(idx, *value);
            map.remove(&key);
        }
```
以下のようなコンパイルエラーが発生します

> cannot borrow `map` as mutable more than once at a time  
> second mutable borrow occurs here rustcE0499

上記の記法では、if let部分でmapのentryの参照を借用することになり、if letが終わるときにentryを返してあげなければいけませんとコンパイラは言っています。しかし、上記の実装だと、map.insert部で更にentry (のvalue)を他のentryに渡しているので結果的にentryのvalueを本来の持ち主に返すことができません。

参照を直接渡し合っているのがまずいので新たなvalueをclone等で作ってあげると回避はできます。

```rust
    // Replacing procedure
    for i in 1..=5 {
        let idx = 2 * i - 1;
        if let Some((&key, value)) = map.range_mut((idx)..).next() {
            // The type of value is &mut Vec<i32>
            &value.push(4);
            let val = value.clone();
            map.insert(idx, val);
            map.remove(&key);
        }
    }
```
この場合、valueの要素分だけコピーする時間が線形にかかってしまいます。もし元々のentryがいらないのであればクローンするのは資源と時間の無駄遣いです。(メタ的な発言をすれば、競プロではTLEの種になります。)

### 第三の方法

第二の方法の何に原因があったかというと、  `if let`でentryを借用していることでした。借用している以上`if let`ブレイスを抜ける直前で参照を返さないといけません。なので`if let`で受け取った値をそのまま他のentryの値として使うことができないのです。

なので`if let`ではコピーで渡してあげたいです。ただし、valがCopyトレイトを実装していないと渡すことができません。もしVec\<i32>がCopyトレイトを実装していたとしても、Vecの要素をすべてコピーしたものを受け取ることはできるだけ避けたいです。

よって valueはアンスコ(\_)で受け取るという発想が出てきます。これであれば`if let`はキーだけコピーで受け取ればいいのでif let ブランケット内でmapのムーブし放題です。

valの中身を変えずにkeyだけ変えたいと思ったときも、1 新しくエンティティを作る 2 そのエンティティにvalをムーブするという方針で対応できます。

```rust
    // Replacing procedure
    for i in 1..=5 {
        let idx = 2 * i - 1;
        if let Some((&key, _)) = map.range((idx)..).next() {
            let val = map.remove(&key).unwrap();
            map.insert(idx, val);
        }
    }
```

ちなみにremoveの代わりにgetを用いると、ムーブできないというコンパイルエラーが発生します。getでは所有権の移動は行われないのです。

上が何故うまくいくのかをまとめると、
1. if letでコピーセマンティックスが働くからif letブレイス内でmapの要素の追加、変更、削除が可能になるから
2. removeによって所有権の移動が可能になり、cloneのような要素のコピーが発生しないから

あたりでまとまるかなと思います。

## サンプルコード
[GitHub - Acasune/btreemap-sample-codes: For a blog article](https://github.com/Acasune/btreemap-sample-codes)  
第一、第二、第三の方法はそれぞれsrc/01.rs、src/02.rs、src/03.rsにおいています。

## 参考文献
以下の書籍で文言の正しさを確認させていただきました。
* [プログラミングRust 第2版](https://amzn.to/3uVE0LW)
* [実践Rustプログラミング入門](https://amzn.to/3RJGB5m)
    