<template>
  <q-page class="q-pa-md">
    <q-tabs
      v-model="tab"
      dense
      class="text-primary"
      active-color="primary"
      align="justify"
    >
      <q-route-tab
        name="rondas"
        label="Relatório de Rondas"
        to="/reports/rondas"
      />
      <q-route-tab
        name="sessao-mentoria"
        label="Relatório de Sessões"
        to="/reports/sessao-mentoria"
      />
    </q-tabs>

    <router-view />
  </q-page>
</template>

<script setup>
import { ref, watch, provide } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tab = ref(route.path.split('/').pop());
const reportMode = ref(false);
provide('reportMode', reportMode);

watch(route, () => {
  tab.value = route.path.split('/').pop();
});
</script>
