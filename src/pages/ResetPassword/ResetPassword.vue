<template>
  <div class="row q-pa-sm text-center justify-center">
    <div class="col-lg-3 col-md-6 col-sm-10">
      <div style="margin-top: 100px">
        <div
          class="col-auto text-grey text-caption q-pt-sm row no-wrap items-center justify-center"
        >
          <q-avatar size="180px">
            <q-img src="~assets/mentoring.png" />
          </q-avatar>
        </div>
        <div class="row text-center column">
          <p
            style="font-family: 'line-awesome'"
            class="text-gray text-h4 text-weight-bold text-blue-10"
          >
            Mentoria
          </p>
        </div>
      </div>

      <q-card class="q-mt-lg" style="max-width: 100%">
        <q-card-section class="login" style="padding: 20px" align="center">
          <q-form class="q-gutter-md" @submit.prevent="submitReset">
            <div
              class="col-12 text-grey-1 text-h5 text-weight-medium"
              style="margin-bottom: 30px"
            >
              Nova Senha
            </div>

            <div class="row q-mb-sm q-mt-lg justify-center">
              <q-input
                outlined
                class="col-12 col-lg-8"
                bg-color="white"
                v-model="password"
                type="password"
                label="Nova Senha"
                :rules="[(val) => !!val || 'Senha é obrigatória']"
                dense
              >
                <template v-slot:append>
                  <q-icon name="lock_open" color="light-blue-10" />
                </template>
              </q-input>
            </div>

            <div class="row q-mb-sm q-mt-lg justify-center">
              <q-input
                outlined
                class="col-12 col-lg-8"
                bg-color="white"
                v-model="confirmPassword"
                type="password"
                label="Confirmar Nova Senha"
                :rules="[
                  (val) => !!val || 'Confirmação é obrigatória',
                  (val) => val === password || 'As senhas não coincidem',
                ]"
                dense
              >
                <template v-slot:append>
                  <q-icon name="lock" color="light-blue-10" />
                </template>
              </q-input>
            </div>

            <div class="row q-mt-lg justify-center q-mb-lg">
              <q-btn
                :loading="submitting"
                class="col-12 col-lg-6 q-py-sm glossy"
                unelevated
                rounded
                color="light-blue-12"
                type="submit"
                label="Atualizar Senha"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useUserStore } from 'src/stores/user/UserStore';
const route = useRoute();
const router = useRouter();
const { alertError, alertSucess } = useSwal();

const UserStore = useUserStore();

const password = ref('');
const confirmPassword = ref('');
const submitting = ref(false);
const token = ref('');

onMounted(() => {
  token.value = (route.params.token as string) || '';
});

const submitReset = async () => {
  if (!password.value || password.value !== confirmPassword.value) {
    alertError('As senhas não coincidem');
    return;
  }

  submitting.value = true;
  try {
    await UserStore.resetPasswordWithToken({
      token: token.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    }).then((resp) => {
      alertSucess('Senha atualizada com sucesso!');
      router.push('/Login');
    });
  } catch (error: any) {
    alertError(error.response?.data?.message || 'Erro ao resetar a senha');
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss">
.login {
  background-color: $primary;
}
</style>
