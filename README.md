# stpd-lang
turing-complete (i hope) language that only uses these 5 characters: `#@$>!`
all the rest are completely ignored 

## installation
your pain starts with this command (which installs the stpd CLI)

`npm i -g stpdc`

## cli usage
run `stpdc <path>` to execute a stpd-lang program
run ``

## manual
> please note that at this point you can turn back and keep your sanity. `Alt + F4` is only two keypresses away. it can even be done one-handed.

stpd-lang runs in a very simplistic runtime environment that has these registers and stacks:

- a (theoretically) infinite stack of numbers, spanning across both negative and positive indicies: `STACK`
- a pointer to a value in that array, starting at index `0`: `PTR`
- a register for storing input used in certain commands: `INPUT`
- a register that stores the index of the current command: `INDEX`
- an array of digits which starts as `[ 0 ]`: `DIGITS`
- a pointer to the **last number in `DIGITS`**: `NUM`
- and a register that holds the sign of `DIGITS` (either `-1` or `1`): `SIGN`

and the syntax is quite simple:

`#` increments the value at `NUM` by one  
`$` decrements the value at `NUM` by one, **or, if `DIGITS` is `[ 0 ]`, switches to negative mode (detailed below)**  
`@` appends the value at `NUM` onto the end of `DIGITS` (effectively duplicating it: e.g. `[ 1 ]` -> `[ 1, 1 ]`)  
`>` sets `INPUT` to `DIGITS` as a single number (e.g. if `DIGITS` is `[ 1, 2, 3 ]` then `INPUT` would become `123`) and **resets** `DIGITS` to `[ 0 ]` and `SIGN` to `1`  
`!` executes the command corresponding to `DIGITS` as a single number and **resets** `DIGITS` to `[ 0 ]`, `SIGN` to `1`, and `INPUT` to `0`

comments can be written with any character but the five listed above.

> **the `SIGN` register and negative numbers**  
> when the interpreter finds an `$` when `DIGITS` is uninitialized (containing a single `0`), it sets `SIGN` to `-1`. when `SIGN` is `-1`, the functions of `$` and `#` are swapped and `DIGITS` will be treated as a negative number in `>` and `!`.
>
here's some examples (assuming `DIGITS` is `[ 0 ]` and `SIGN` is `1` before each example):  
`#` sets `DIGITS` to `[ 1 ]`  
`$` sets `DIGITS` to `[ 1 ]` **and** sets `SIGN` to `-1`  
`#@$` sets `DIGITS` to `[ 1, 0 ]`  
`$@#` sets `DIGITS` to `[ 1, 0 ]` **and** sets `SIGN` to `-1`  
`#@#@#` sets `DIGITS` to `[ 1, 2, 3 ]`  
`$@$@$` sets `DIGITS` to `[ 1, 2, 3 ]` **and** sets `SIGN` to `-1`  

`# > #!` sets `INPUT` to `1`, and executes command `1`  
`$$$$$ > #@#!` sets `INPUT` to `-5`, and executes command `12`  

### commands

index | description
----- | -----------
0     | terminates the program, using `INPUT` as the exit code.
10    | sets `PTR` to `INPUT`
11    | adds `INPUT` to `PTR`
12    | shifts `PTR` index by `INPUT`
13    | sets `INPUT` to `PTR`
14    | sets `PTR` to a random number between 0 and `INPUT` (inclusive)
15    | adds the value from `STACK` that is offset from `PTR` by `INPUT` to `PTR`
16    | flips the sign of `PTR`
20    | sets `PTR` to `INDEX`
21    | sets `INDEX` to `PTR`
22    | skips next instruction if `PTR` is equal to `INPUT`
23    | unconditionally skips next `INPUT` instructions
24    | skips next instruction if `PTR` is negative
30    | prints `PTR` as a unicode character
31    | prints `PTR` as a number
32    | waits for input, then sets `PTR` to the inputted character's code point

### example programs

#### hello world
```
#######@$$$$$ > #@$! ###@$$$!   set PTR to 72 and print PTR   H
##@####### > #@! ###@$$$!       add 29 to PTR and print PTR   e
####### > #@! ###@$$$!          add 7 to PTR and print PTR    l
###@$$$!                        print PTR again               l
### > #@! ###@$$$!              add 3 to PTR and print PTR    o
$$$$$$@$ > #@! ###@$$$!         add -67 to PTR and print PTR  ,
$@$ > #@! ###@$$$!              add -12 to PTR and print PTR  (space)
#####@ > #@! ###@$$$!           add 55 to PTR and print PTR   W
##@## > #@! ###@$$$!            add 24 to PTR and print PTR   o
### > #@! ###@$$$!              add 3 to PTR and print PTR    r
$$$$$$ > #@! ###@$$$!           add -6 to PTR and print PTR   l
$$$$$$$$ > #@! ###@$$$!         add -8 to PTR and print PTR   d
$$$$$$@$ > #@! ###@$$$!         add -67 to PTR and print PTR  (exclamation mark)
```

#### hello world (minified)
```
#######@$$$$$>#@$!###@$$$!##@#######>#@!###@$$$!#######>#@!###@$$$!###@$$$!###>#@!###@$$$!$$$$$$@$>#@!###@$$$!$@$>#@!###@$$$!#####@>#@!###@$$$!##@##>#@!###@$$$!###>#@!###@$$$!$$$$$$>#@!###@$$$!$$$$$$$$>#@!###@$$$!$$$$$$@$>#@!###@$$$!
```