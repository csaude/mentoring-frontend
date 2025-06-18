<template>
  <div class="settings-page q-pa-md bg-white">
    <q-tabs
      v-model="activeTab"
      class="text-primary q-px-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      dense
    >
      <q-tab name="programs" label="Programas" />
      <q-tab name="programmaticArea" label="Áreas de Mentoria" />
      <q-tab name="professionalCategory" label="Categorias Profissionais" />
      <q-tab name="question" label="Competências" />
      <q-tab name="healthFacility" label="Unidades Sanitárias" />
      <q-tab name="partner" label="Instituições" />
      <q-tab name="user" label="Utilizadores" />
    </q-tabs>

    <q-separator class="q-mx-md" />

    <q-tab-panels v-model="activeTab" animated class="q-mt-md">
      <q-tab-panel name="programs">
        <Programs />
      </q-tab-panel>

      <q-tab-panel name="programmaticArea">
        <ProgrammaticAreas />
      </q-tab-panel>

      <q-tab-panel name="professionalCategory">
        <ProfessionalCategories />
      </q-tab-panel>

      <q-tab-panel name="question">
        <Questions />
      </q-tab-panel>

      <q-tab-panel name="healthFacility">
        <HealthFacilities />
      </q-tab-panel>

      <q-tab-panel name="partner">
        <Partners />
      </q-tab-panel>

      <q-tab-panel name="user">
        <Users
          @create="activeTab = 'userForm'"
          @reset-password="activeTab = 'passwordReset'"
          @select-user="onUserSelection"
          @edit-user="activeTab = 'userEdit'"
        />
      </q-tab-panel>

      <q-tab-panel name="userForm">
        <UserForm @cancel="activeTab = 'user'" />
      </q-tab-panel>

      <q-tab-panel name="userEdit">
        <UserForm @cancel="activeTab = 'user'" />
      </q-tab-panel>

      <q-tab-panel name="passwordReset">
        <PasswordReset @cancel="activeTab = 'user'" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Programs from 'src/components/settings/ProgramSettings.vue';
import ProgrammaticAreas from 'src/components/settings/ProgrammaticAreas.vue';
import Questions from 'src/components/settings/Questions.vue';
import ProfessionalCategories from 'src/components/settings/ProfessionalCategories.vue';
import HealthFacilities from 'src/components/settings/HealthFacility.vue';
import Partners from 'src/components/settings/Partners.vue';
import Users from 'src/components/Users/Users.vue';
import UserForm from 'src/components/Users/UserForm.vue';
import PasswordReset from 'src/components/Users/PasswordReset.vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import roleService from 'src/services/api/role/roleService';

const { closeLoading, showloading } = useLoading();
const activeTab = ref('programs');
const selectedUser = ref(null);


onMounted(() => {
  showloading();
  init();
});

const init = () => {
  activeTab.value = 'programs';
  roleService.getAll();
  closeLoading();
};

const onUserSelection = (user) => {
  selectedUser.value = user;
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
}
</style>
