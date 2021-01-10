# LAIG 2020/2021 - TP1

## Group: T03G08

| Name                              | Number    | E-Mail               |
| --------------------------------- | --------- | -------------------- |
| António Cadilha da Cunha Bezerra  | 201806854 | up201806854@fe.up.pt |
| Pedro Jorge Fonseca Seixas        | 201806227 | up201806227@fe.up.pt |

----
## Project information

- Strong points
  - When the textures are being parsed, a function is called to check if the path actually exists and throws a warning to the user.
  - Before we start displaying the scene, the graph is checked for cycles so that the program doesn't crash in the case of a small mistake that causes a cycle.
  - It is also checked if any node defined isn't used and warns the user about that.
  - The nodes are stored in a map where their ID is the key for easier and faster access when displaying.
  - We made the parser so that when any error comes up we ensure that the user knows where it is from, by sending specific messages for the different types and places of errors.
  - Our interface allows the user to rotate the camera with the WASD keys.
  - Our interface has lighting moods, specific to our native scene.
- Scene
  - The scene consists in a rowing boat in the middle of the sea with some buoys around it.
  - [XML File](./scenes/LAIG_TP1_T3_G08.xml)
----
## Issues/Problems

- At the moment there are no problems known.
