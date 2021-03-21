---
title: 'C++のソートをもっと柔軟に行う'
date: '2020-04-11'
description: 'AC++のソートをもっと柔軟に行う'
tags: ['AtCoder', 'cpp']
---

突然ですが、C++ユーザーの競プロ er のみなさまは一度は sort 関数を使用したことがおありだと思いますが、sort の第 3 引数に渡されがちな、greater\<int>()って何者なのかご存知ですか？

sort の[公式ドキュメント](https://cpprefjp.github.io/reference/algorithm/sort.html)を見ると、第 1 引数、第 2 引数にイテレータを、第 3 引数に"Compare"型のオブジェクトを取ることがわかる。つまり、greater\<int>()は"Compare 型"のオブジェクトだったのだー!!

## Compare 型のオブジェクトってなんだよ

僕もわかりません。一緒に[公式ドキュメント](https://cpprefjp.github.io/reference/algorithm.html)を読みましょう。(本題の sort を使いこなすことのみに興味がある人は適宜飛ばし読みしてくれ)

適当に関連しそうな部分を引用する

> - Compare は関数オブジェクト型である。
> - Compare 型のオブジェクトに適用した関数呼び出しの戻り値は、 bool へ文脈依存の変換をされたとき、第一引数が第二引数より小さい場合は true を、そうでない場合は false を返す。
> - 何らかの順序関係 (ordering relation) を前提とするアルゴリズム全般に対して Compare 型の comp を使用する。
> - comp は間接参照したイテレータを通して非 const な関数を適用しないものとする。

以上の引用のなかで重要だと僕が考える点を整理する。

- Compare は関数オブジェクトであること
- (Compare 型の関数オブジェクトの)第 1 引数と第 2 引数を比較して bool 値を判定している

> 何らかの順序関係 (ordering relation) を前提とするアルゴリズム全般に対して Compare 型の comp を使用する。

ここの部分の議論(どう順序関係を組み立てればよいか)はまた別の話だと思うので割愛します。ただ、プログラミングの順序の議論を行う際に、数学の集合論の議論を援用しているので興味がある人は例えば松坂『集合・位相入門』を読むなどで補完してみても良いと思う。  
他の言語でいうと、例えばジョシュア・ブロック『Effective Java 第 3 版』項目 14「Compareble の実装を検討する」が詳しい。

閑話休題。つまり Compare 型は第 1 引数と第 2 引数を"何らかの順序関係"をもとに比較して第一引数が小さい場合は true を、大きい場合は false を取る関数であることがわかった。この時点で、sort 関数が何を内部で実現しようとしているのかのベールが一枚剥がされた。イメージは配列が渡されたら一つ一つ Compare 型の関数の引数にぶちこんで判定結果の bool 値をもとに小さい順に並べ替えているのだ。

改めて greater\<int>()の中身を見る。以下は[公式ドキュメント](http://www.cplusplus.com/reference/functional/greater/)からの引用

```cpp
template <class T> struct greater {
  bool operator() (const T& x, const T& y) const {return x>y;}
  typedef T first_argument_type;
  typedef T second_argument_type;
  typedef bool result_type;
};
```

operator()で第 1 引数が第 2 引数より大きいなら true を、小さいなら false を取るような処理が実装されていることがわかる。(operator はオーバーロードされた関数である点に注意)。これによって、ソート後の配列の連続する 2 つの要素についても operator と矛盾しないような順番に並べ替えることが可能になる(...ぽい)。C++の実装箇所は[ここ](https://github.com/gcc-mirror/gcc/blob/d9375e490072d1aae73a93949aa158fcd2a27018/libstdc%2B%2B-v3/include/bits/stl_algo.h#L1950)

## 柔軟にソートする

上の議論から、Compare 型(の中の Operator 型)の関数オブジェクトに実装された処理に従って、ソートが行われることがわかった。じゃあ、その Compare の法則をユーザーが独自に定義して渡せちゃうんじゃね？というのがこの記事の本題。  
結論からいえば渡せます。ラムダ関数という機能を使って関数オブジェクトを即席でこしらえて渡してあげればいいです。
また便利な[公式リファレンス](https://cpprefjp.github.io/lang/cpp11/lambda_expressions.html)。ラムダ式の細かな説明は省きます。例も上の公式リファレンスが有能すぎるのでぜひご参照を。僕の方でもラムダ式を理解できるような一つ例を出してみます

```cpp
auto greater=[](int a, int b){return a>b;};
```

たったこれだけの記述で、int 型の第 1 引数 a が int 型第 2 引数より真に大きければ true を、そうでなければ false を返す関数`greater`が定義できちゃいます。
例を示すと

```cpp
bool a = greater(1,2); //false
bool b = greater(2,1); //true
bool c = greater(1,1); //true
```

こんな感じでしょうか。この処理って "第 1 引数が第 2 引数より大きいなら true を、小さいなら false を取るような処理" にほかなりません。しかもラムダ式は関数オブジェクトなので sort の第 3 引数に渡せちゃいます。挙動を僕の Mac で確かめてみる。

```cpp
#include <iostream>
#include<vector>
#include <algorithm>

int main(){
#include <iostream>
#include<vector>
#include <algorithm>

int main(){

  std::vector<int> vec{7,3,5,2,9,10};

  std::cout<<"ソート前出力結果:"<<" ";
  for(auto v:vec){
    std::cout<<v<<" ";
  }
  std::cout<<"\n";

  auto greater_=[](int a, int b){return a > b;};
  std::cout<<"ソート後出力結果:"<<" ";
  sort(vec.begin(),vec.end(),greater_);
  for(auto v:vec){
    std::cout<<v<<" ";
  }
  std::cout<<"\n";

  return 0;

}


}
```

結果は

```bash
ソート前出力結果: 7 3 5 2 9 10
ソート後出力結果: 10 9 7 5 3 2
```

見事大成功である。こうして 2 つの引数をとり、返り値が bool 型の関数をラムダ式で定義してあげて渡してあげると、その処理通りの処理を sort が行ってくれることがわかる。

(ぶっちゃけ僕自身有益なことを提供できそうにないので)詳細を省くが、ここでの引数の型はなんでもよいです。stuct でも dict でも map でも。

## いい感じの使い方を教えてよ

例えば vector<pair<int,int>>で、first の部分は辞書順で、もし first 要素が等価ならば second を逆辞書順でソートしたいといういささか病的な例を上げる。
この処理をラムダ式として記述すると以下のような感じになる。

```cpp
auto juunannna_soto=[](pair<int,int> p1,pair<int,int> p2){
    if(p1.first!=p2.first){return p1.first<p2.first}
    else{return p1.second>p2.second}
}

```

果たして要望通りソートしてくれるのか...???

```cpp
#include <iostream>
#include <vector>
#include <utility>
#include <algorithm>

typedef std::pair<int,int> P;

int main(){


  std::vector<P> vec{{2,3},{2,2},{2,1},{1,10},{3,1},{3,2},{1,1},{3,3},{2,2}};

  std::cout<<":"<<" ";
  for(auto v:vec){
    std::cout<<'{'<<v.first<<','<<v.second<<'}'<<" ";
  }
  std::cout<<"\n";

  auto juunannna_soto=[](P p1,P p2){
    if(p1.first!=p2.first){return p1.first<p2.first;}
    else{return p1.second>p2.second;}
  };

  std::cout<<":"<<" ";
  sort(vec.begin(),vec.end(),juunannna_soto);
  for(auto v:vec){
    std::cout<<'{'<<v.first<<','<<v.second<<'}'<<" ";
  }
  std::cout<<"\n";

  return 0;

}

```

出力結果は

```bash
ソート前出力結果: {2,3} {2,2} {2,1} {1,10} {3,1} {3,2} {1,1} {3,3} {2,2}
ソート後出力結果: {1,10} {1,1} {2,3} {2,2} {2,2} {2,1} {3,3} {3,2} {3,1}
```

やりました 😋

最後の例は構造体です。
構造体のメンバー a,b,c について、「まず a が大きい順を考える、a が等しかったら b が小さな順を考える。もし b も等しかったら c が大きな順に並べる」というものを考えてみる。また、ラムダ式の引数は型推論できるので auto と記述することができます。
予め処理を書くとこんな感じでしょうか。

```cpp
auto struct_sort=[](auto st1,auto st2){
    if(st1.a!=st2.a){return st1.a>st2.a;}
    else if(st1.b!=st2.b){return st1.b<st2.b;}
    else {return st1.c>st2.c;}
};

```

実験していきましょう。

```cpp
#include <iostream>
#include <vector>
#include <utility>
#include <algorithm>

typedef std::pair<int,int> P;

struct my_struct{
    int a;
    int b;
    int c;
};

int main(){

  std::vector<my_struct> vec{
    {1,2,3},{1,200,3},{8,100,59},{8,1,1},{8,101,9},{5,5,1},{5,5,5},{1,2,3},{190,80,4}
  };

  std::cout<<"ソート前出力結果:"<<" ";
  for(auto v:vec){
    std::cout<<'{'<<v.a<<','<<v.b<<','<<v.c<<'}'<<" ";
  }
  std::cout<<"\n";

  auto struct_sort=[](auto st1,auto st2){
      if(st1.a!=st2.a){return st1.a>st2.a;}
      else if(st1.b!=st2.b){return st1.b<st2.b;}
      else {return st1.c>st2.c;}
  };

  std::cout<<"ソート後出力結果:"<<" ";
  sort(vec.begin(),vec.end(),struct_sort);
  for(auto v:vec){
    std::cout<<'{'<<v.a<<','<<v.b<<','<<v.c<<'}'<<" ";
  }
  std::cout<<"\n";

  return 0;

}

```

出力結果は以下のようになります

```bash
ソート前出力結果: {1,2,3} {1,200,3} {8,100,59} {8,1,1} {8,101,9} {5,5,1} {5,5,5} {1,2,3} {190,80,4}
ソート後出力結果: {190,80,4} {8,1,1} {8,100,59} {8,101,9} {5,5,5} {5,5,1} {1,2,3} {1,2,3} {1,200,3}
```

この例ではうまくいきました!!(例をいくつも上げたところで法則を verify できるわけではないので控えめな表現で...)

このようにしてソートを柔軟に使いこなして、高パフォーマンスを目指していきましょう!

## 落穂広いのコーナー

まず、他の競技者の人のコードを見る感じ、例えば構造体の例を用いると以下のような書きぶりになりそう。

```
sort(vec.begin(),vec.end(),[](auto st1,auto st2){
      if(st1.a!=st2.a){return st1.a>st2.a;}
      else if(st1.b!=st2.b){return st1.b<st2.b;}
      else {return st1.c>=st2.c;}
  });
```

説明のためにあえて sort 関数外でラムダ式を書いていましたが、第 3 引数に直接記述することも可能です。

次に AtCoder の例題たちです。この記事のように sort を柔軟に使えたから解きやすかったなと記憶に残っているものを上げていきます。

・AtCoder Beginner Contest 128 B - Guidebook  
[https://atcoder.jp/contests/abc128/tasks/abc128_b](https://atcoder.jp/contests/abc128/tasks/abc128_b)
・AtCoder Beginner Contest 113 C - ID  
[https://atcoder.jp/contests/abc113/tasks/abc113_c](https://atcoder.jp/contests/abc113/tasks/abc113_c)
・AtCoder Beginner Contest 091 C - 2D Plane 2N Points  
[https://atcoder.jp/contests/abc091/tasks/arc092_a](https://atcoder.jp/contests/abc091/tasks/arc092_a)
・AtCoder Beginner Contest 091 C - 背の順 [https://atcoder.jp/contests/abc041/tasks/abc041_c](https://atcoder.jp/contests/abc041/tasks/abc041_c)
