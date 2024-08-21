import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#ffe6f8",
    width: 500,
    height: 720,
  },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 280, 30, 780, {
  isStatic: true,
  render: { fillStyle: "#a6a6a6" },
});

const rightWall = Bodies.rectangle(485, 280, 30, 780, {
  isStatic: true,
  render: { fillStyle: "#a6a6a6" },
});

const ground = Bodies.rectangle(250, 690, 550, 60, {
  isStatic: true,
  render: { fillStyle: "#a6a6a6" },
});

const topLine = Bodies.rectangle(240, 130, 500, 2, {
  label: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#a6a6a6" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let win = false;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(250, 50, fruit.radius, {
    index: index,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.4,
  });

  Body.setStatic(body, true);

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) return;

  switch (event.code) {
    case "KeyA":
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);

      break;

    case "KeyD":
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 470)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5);

      break;

    case "KeyS":
      Body.setStatic(currentBody, false);
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
};

window.onmousedown = (event) => {
  if (disableAction) return;

  const mouseX = event.clientX - render.canvas.getBoundingClientRect().left;

  if (mouseX > 30 && mouseX < 470) {
    Body.setPosition(currentBody, {
      x: mouseX,
      y: currentBody.position.y,
    });

    Body.setStatic(currentBody, false);
    disableAction = true;

    setTimeout(() => {
      addFruit();
      disableAction = false;
    }, 1000);
  }
};

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
      break;
  }
};

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` },
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
      if (newBody.index == 10 && !win) {
        setTimeout(() => {
          alert("You Win!!!");
          win = true;
        }, 100);
      }
    }

    if (!disableAction) {
      if (
        (collision.bodyB.label === "topLine" &&
          collision.bodyB.position.y > topLine.position.y - 10) ||
        (collision.bodyA.label === "topLine" &&
          collision.bodyA.position.y > topLine.position.y - 10)
      ) {
        alert("Game over");
        location.reload();
      }
    }
  });
});

addFruit();
