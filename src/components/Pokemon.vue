<template>
  <div class="container-xl">
    <div v-if="notFound" class="text-center">
      <h1>Pokémon not found :(</h1>
      <button
        @click="$router.push({ name: 'home' })"
        class="btn btn-outline-dark"
      >
        Go back
      </button>
    </div>
    <div v-else-if="!loaded" class="row mt-5">
      <div class="col mt-5">
        <img
          class="placeholder-large img-fluid mx-auto d-block"
          style="{ max-width: 300px; max-height: 300px; }"
          :src="require('@/assets/img/pokeball-large.png')"
          :alt="name"
        />
      </div>
    </div>
    <div v-else class="pokedex-front card border border-5 border-dark py-4 px-2">
      <div class="row p-4 m-5">
        <!-- Pokemon image/art -->
        <div class="col-sm-12 col-md-7 col-lg-6 pokedex-screen1 text-center">
          <img
            v-if="currentSrc === null"
            class="img-fluid mx-auto mb-5 d-block position-relative placeholder-large"
            style="{ max-width: 200px; max-height: 200px; top: 25%; }"
            :src="require('@/assets/img/pokeball-large.png')"
            :alt="name"
          />
          <img
            v-else
            class="img-fluid mx-auto my-auto mt-3 d-block"
            :src="image"
            :alt="name"
          />
        </div>

        <!-- Content -->
        <div class="col-sm-12 col-md-5 col-lg-6 d-flex flex-column justify-content-between text-center">
          <!-- Pokemon name and type(s) -->
          <div class="mx-5 px-5">
            <div class="pokedex-viewer">
              <h1 class="display-4 mt-1 mt-md-1">
              <strong>{{ name }}</strong>
              <h4 class="mt-3">
                <span
                  v-for="(type, idx) in pokemon.types"
                  v-bind:key="idx"
                  :class="'badge badge-type rounded-pill text-white ' + type"
                >
                  {{ type.toUpperCase() }}
                </span>
              </h4>
              </h1>
            </div>
            <!-- Pokemon info (id, height and weight) -->
            <div class="mx-0 px-0 pokedex-screen2 ">
              <h2 class="mt-md-2 mb-4"> <span class="text-dark font-weight-bold">{{ number(pokemon.id) }}</span></h2>
              <h3 class="mt-md-2 mb-4"> Height: {{ pokemon.height/10 }} m</h3>
              <h3 class="mt-md-2 mb-4"> Weight : {{ pokemon.weight/10 }} kg</h3>
            </div>
        </div>
          <!-- Navigation buttons (prev/next) -->
          <div class="mb-3 mb-md-5 mt-5">
            <button
              v-if="parseInt(id) > 1"
              @click="navigate(pokemon.id - 1)"
              class="btn-prev h-100 w-sm-50 w-md-25"
              style="margin-right: 0.1em;"
            >
              Prev ({{ number(pokemon.id - 1) }})
            </button>
            <button
              v-if="parseInt(id) < maxPokemon"
              @click="navigate(pokemon.id + 1)"
              class="btn-next h-100 w-sm-50 w-md-25"
              style="margin-left: 0.1em;"
            >
              Next ({{ number(pokemon.id + 1) }})
            </button>
          </div>
        </div>
      </div>
      <!-- STATUS & DESCRIPTION -->
      <div class="card-body mh-100">
          <div class="row mx-5 my-5 py-5 pokedex-viewer align-items-start">
            <div class="col-6 col-sm-10 col-md-2 col-lg-3 d-flex flex-column mx-auto">
            <h4 class="mb-3 mt-3">STATS</h4>
            <div v-for="(s, idx) in pokemon.stats" :key="idx">
            <h6> 
            {{ s.name.toUpperCase() }}
            <span>{{ s.value }}</span>
            </h6>
            <div :class="'progress mb-3'" style="height: 25px;">
            <div
              :class="pokemon.types[0] + ' progress-bar text-start '"
              role="progressbar"
              :style="`width: ${(s.value/160) * 100}%; height: 100%;`"
            >
            </div>
            </div>
          </div>
        </div>
            <div class="col-6 col-sm-10 col-md-2 col-lg-3 d-flex flex-column mx-auto">
              <h4 class="mt-3">DESCRIPTION</h4>
              <p class="mt-5" style="font-size: 1.4rem">
                {{ pokedexEntry }}
              </p>
            </div>
            
          </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import pokemonMixin from "../mixins/pokemonMixin";

export default {
  name: "Pokemon",
  props: {
    id: Number,
  },
  mixins: [pokemonMixin],
  data() {
    return {
      pokemon: {},
      notFound: false,
      maxPokemon: 898,
      loaded: false,
      currentSrc: null,
      pokedexEntry: '',
    };
  },
  computed: {
    name() {
      if (Object.keys(this.pokemon).length > 0) {
        return this.pokemon.name;
      } else {
        return "";
      }
    },
    types() {
      if (Object.keys(this.pokemon).length > 0) {
        return this.pokemon.types;
      } else {
        return ["loading"];
      }
    },
    image() {
      if (Object.keys(this.pokemon).length > 0) {
        return this.pokemon.art;
      } else {
        return require("@/assets/img/pokeball.png");
      }
    },
  },
  methods: {
    number(id) {
      return this.formatNumberId(id.toString());
    },
    setOnLoad(img) {
      let that = this;
      img.onload = function () {
        that.currentSrc = that.pokemon.image;
      };
      img.src = that.pokemon.image;
    },
    fetchPokemon(id) {
      let pokemonImg;
      pokemonImg = new Image();
      let name = this.$pokedexCache.get(parseInt(id));
      if (name) {
        this.pokemon = this.$pokedexCache.get(name);
        this.loaded = true;
        console.log(`loaded ${name} from cache`);
        this.setOnLoad(pokemonImg);
        this.fetchEntry();
      } else {
        console.log(`fetching #${id}`);
        axios
          .get("https://pokeapi.co/api/v2/pokemon/" + id)
          .then(({ data }) => {
            this.pokemon = this.parsePokemon(data);
            this.loaded = true;
            this.setOnLoad(pokemonImg);
            this.$pokedexCache.set(this.pokemon.name, this.pokemon);
            this.$pokedexCache.set(this.pokemon.id, this.pokemon.name);
            this.fetchEntry();
          })
          .catch((err) => {
            if (err.response.status === 404) {
              this.notFound = true;
            } else {
              console.log(err);
            }
          });
      }
    },
    fetchEntry() {
      axios.get(this.pokemon.species_url).then(({data}) => {
        let entries = data.flavor_text_entries
          .filter(e => e.language.name === 'en' && !e.flavor_text.includes('\u000c'))
          .map(e => e.flavor_text);
        this.pokedexEntry = entries[0];
      }).catch(err => console.log(err));
    }
  },
  created() {
    this.fetchPokemon(this.id);
  },
  beforeRouteUpdate(to) {
    this.loaded = false;
    this.currentSrc = null;
    this.pokedexEntry = '';
    this.fetchPokemon(to.params.id);
  }
};
</script>

<style>
  .pokedex-front{
    background-color: #dc0a2d !important;
  }
  .pokedex-screen1{
    border-width: 4em 4em;
    border-color: #dadada;
    border-radius: 2%;
    border-style: solid;
    background-color: #212121;
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 10% 100%, 0 90%);
  }
  .pokedex-screen2{
    border-width: 0.75em;
    border-color: #dadada;
    border-radius: 2%;
    border-style: solid;
    background-color: #51ad60;
    margin-top: 20%;
  }
  .pokedex-screen2 h2{
    font-weight: bold;
    font-family:  serif, "Times New Roman", Times;
    font-size: 3em !important;
  }
  .pokedex-screen2 h3{
    font-family:  serif, "Times New Roman", Times;
    font-size: 2.5em !important;
  }
  .pokedex-viewer{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #37d244;;
    background: #2c2c2c; 
    border-width: 1vh 0.5vw;
    border-style: solid;
    border-color: black;
    border-radius: 1%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pokedex-viewer h4{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #37d244;;
    font-size: 1.5rem;
    font-weight: bold;
  }
  .pokemon-img{
    border-width: 8vw 20vh ;
    border-color: #dadada;
    border-radius: 2%;
    border-style: solid;
  }
  .btn-prev{
    background: red;
    color: white;
    border-width: 0.25em;
    border-style: solid;
    border-color: black;
    border-radius: 4%;
    margin-right: 10% !important;
    outline: 0 !important;
  }
  .btn-next{
    background: blue;
    color: white;
    border-width: 0.25em;
    border-style: solid;
    border-color: black;
    border-radius: 4%;
    margin-left: 10% !important;
    outline: 0 !important;
  }
</style>