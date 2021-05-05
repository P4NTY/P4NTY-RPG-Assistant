# RPG-Assistant
Discord Bot for Pen &amp; Paper rolling

Normal roll: 
  -
  - Normal: 
    - /r [dices]k[walls]
    - input  /r 3k6
    - output [ (5,1,4) ]   :arrow_forward:   10
  - Math roll:
    - /r `math euqal with dice as variable`
    - input: /r 3k6 *5
    - output: [ (3,4,3) * 5 ]   :arrow_forward:   50

    or

    - input: /r 3k6 + 1k4
    - output: [ (1,3,1) + (1) ]   :arrow_forward:   6

Call of Cthulhu:
  -
  - Normal:
    - /cr [bonus dices]b [penal dices]p
    - input: /cr 2b 1p 
    - output: [ 7 , 20 , 10 ]   :arrow_forward:   17 
  - Skill test roll:
    - /cr [skill] [difficult] [bonus dices]b [penal dices]p
    - input: /cr 50 1/2 2b 1p
    - output: :x: Porażka    [ 1 , 80 , 30 ]   :arrow_forward:   31
  - Hide Roll `result send to MG`
    - /hcr [skill] [difficult] [bonus dices]b [penal dices]p
     
Warhammer:
  - 
  - Normal
    - /wr
    - input: /wr
    - output: [ 70, 6 ]   :arrow_forward:   76 
  - Skill test roll
    - /wr [skill]
    - input: /wr 50
    - output:   (+2) :white_check_mark: Trudny Sukces    [ 30, 2 ]   :arrow_forward:   32
  - Hide Roll `result send to MG`
    - /hwr [skill]

Dungeons & Dragons:
-
  - Nromal roll
    - input: /dr
    - output:  [ 10 ]   :arrow_forward:   10
  - Skill roll
    - /dr [modyficator] [bonus dices]b
    - input: /dr -4 2b
    - output: [ 19,17,7 ] -4  :arrow_forward:   15 
  - Hide Roll `result send to MG`
    - /hdr [modyficator] [bonus dices]b

Tales from the Loop
-
  - Normal roll
    - /tr [dices]
    - input: /tr 10
    - output: [ 6 , 4 , 4 , 2 , 2 , 5 , 4 , 2 , 3 , 4 ]  :arrow_forward:   1
  - Hide Roll `result send to MG`
    - /htr [dices]

Other command:
-
  - /setNofify - set Notification channel and register your guild
  - /setMG `Kiszu` - set Game Master for channel
  - /pomocy! || '/help!' - paste link to this Readme
  - /kiedy? || '/when?' - return next session info
  - /stats - check guild's settings
