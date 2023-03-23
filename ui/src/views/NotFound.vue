<template>
    <div id="notfound">
      <img id="page404-img" src='../assets/404.png' alt="Error 404"/>
      <img id="page404-gif" src='../assets/rickRoll.gif' alt="Gif Rick Roll"/>
    </div>
</template>

<script>
export default {
// eslint-disable-next-line vue/multi-word-component-names
  name: "NotFound"
}
</script>

<style>
  #notfound {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;

        background-image: url('../assets/background/main.png');
        background-size: cover;
  }

  #page404-gif {
      border-radius: 20px;
      width: 30%;
  }

  @media screen and (max-width:700px) {
      #page404-gif {
          display: none;
      }
      #page404-img {
          width: 80%;
      }
  }

  @media screen and (max-width:1200px) {
      #page404-img {
          width: 50%;
      }
  }
</style>