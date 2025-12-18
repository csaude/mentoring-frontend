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
          <q-form class="q-gutter-md" @submit.prevent="authUser">
            <div
              class="col-12 text-grey-1 text-h5 text-weight-medium"
              style="margin-bottom: 30px"
            >
              LOGIN
            </div>
            <div class="row q-mb-sm q-mt-lg justify-center">
              <q-input
                outlined
                class="col-12 col-lg-8"
                bg-color="white"
                ref="usernameRef"
                v-model="username"
                color="red-9"
                label-color="light-blue-10"
                label="Utilizador"
                :rules="[
                  (val) =>
                    val.length >= 3 ||
                    'O nome do utilizador deve ter um minimo de 4 caracteres',
                ]"
                dense
              >
                <template v-slot:append>
                  <q-icon name="person" color="light-blue-10" />
                </template>
              </q-input>
            </div>
            <div class="row q-mb-sm q-mt-lg justify-center">
              <q-input
                class="col-12 col-lg-8"
                outlined
                bg-color="white"
                color="red-9"
                label-color="light-blue-10"
                v-model="password"
                ref="passwordRef"
                type="password"
                label="Password"
                :rules="[
                  (val) =>
                    val.length >= 4 ||
                    'A senha deve ter um minimo de 4 caracteres',
                ]"
                dense
              >
                <template v-slot:append>
                  <q-icon name="lock_open" color="light-blue-10" />
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
                label="Entrar"
                style="border: solid 1px white"
              />
            </div>
          </q-form>
          <div class="row q-mt-sm justify-center">
            <q-btn
              flat
              color="light-blue-10"
              @click="showForgotPassword = true"
            >
              Esqueceu a Password?
            </q-btn>
          </div>

          <div class="row">
            <label class="col text-right">v{{ appVersion }}</label>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <q-dialog v-model="showForgotPassword">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6 text-center">Recuperar Password</div>
        <div class="q-mt-md">
          <q-input
            v-model="recoveryEmail"
            type="email"
            label="Email"
            outlined
            dense
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-btn
          label="Enviar"
          color="light-blue-10"
          :loading="submittingRecovery"
          @click="sendRecoveryEmail"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import UsersService from 'src/services/api/user/UsersService';
import { useUserStore } from 'src/stores/user/UserStore';
import { useRouter } from 'vue-router';
import { Loading, QSpinnerRings } from 'quasar';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { version } from '../../../package.json';

const username = ref('');
const password = ref('');
const usernameRef = ref(null);
const passwordRef = ref(null);
const submitting = ref(false);
const router = useRouter();
const { alertSucess, alertError } = useSwal();
const appVersion = version;

const showForgotPassword = ref(false);
const recoveryEmail = ref('');
const submittingRecovery = ref(false);
const UserStore = useUserStore();

const sendRecoveryEmail = async () => {
  console.log('recoveryEmail.value', recoveryEmail.value);
  if (!recoveryEmail.value) {
    alertError('Por favor insira um email válido.');
    return;
  }

  submittingRecovery.value = true;

  try {
    await UserStore.forgotPassword({
      email: recoveryEmail.value,
      channel: 'WEB', // sempre WEB no login web
      deviceId: null, // sem deviceId para WEB
    });
    submittingRecovery.value = false;
    showForgotPassword.value = false;
    alertSucess('Email enviado com sucesso. Verifique sua caixa de correio.');
    recoveryEmail.value = '';
  } catch (err) {
    submittingRecovery.value = false;
    alertError(
      err.response?.data?.message || 'Erro ao enviar email de recuperação.'
    );
  }
};

const authUser = async () => {
  Loading.show({
    spinner: QSpinnerRings,
  });
  usernameRef.value.validate();
  passwordRef.value.validate();

  if (!passwordRef.value.hasError && !usernameRef.value.hasError) {
    UsersService.login({
      username: username.value,
      password: password.value,
    })
      .then((response) => {
        submitting.value = false;

        if (response !== undefined && response.status === 200) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem(
            'userInfo',
            JSON.stringify(response.data.userInfo)
          );
          localStorage.setItem('tokenExpiration', String(Date.now() + 900000));
          localStorage.setItem('userData', JSON.stringify(response.data));

          UsersService.startTokenSynchronization();
          router.push({ path: '/' });
        } else {
          alertError(response.response.data.message);
        }
        Loading.hide();
      })
      .catch((error) => {
        Loading.hide();
        submitting.value = false;
        alertError(error.response.data.message);
      });
  }
};
</script>

<style lang="scss">
.login {
  background-color: $primary;
}
</style>
