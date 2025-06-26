<template>
  <div class="q-ma-none page-container">
     <q-banner dense inline-actions class="text-white bg-primary q-px-md full-width">
        Dados do Utilizador
        <template #action>
          <q-btn dense flat round color="red" icon="close" @click="$emit('cancel')"/>
        </template>
      </q-banner>
    <form ref="myForm">
      <q-card flat class="q-pa-sm q-ma-md">

        <!-- Identificação do Utilizador -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="person_outline" size="sm" class="q-mr-xs" />Identificação do Utilizador</div>
          <div class="row q-col-gutter-md">
            <q-input outlined label="Nome" dense ref="nameRef"
                     :rules="[(val) => !!val || 'Por favor indicar o nome']" lazy-rules
                     class="col" v-model="user.employee.name" />
            <q-input outlined label="Apelido" dense ref="surnameRef"
                     :rules="[(val) => !!val || 'Por favor indicar o apelido']" lazy-rules
                     class="col" v-model="user.employee.surname" />
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <q-input outlined label="NUIT" dense ref="nuitRef" mask="#########" fill-mask="#"
                     :rules="[(val) => isValidNuit(val) || 'Por favor indicar um NUIT válido.']"
                     class="col" v-model="user.employee.nuit" />
          </div>
        </q-card-section>

        <!-- Contacto -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="call" size="sm" class="q-mr-xs" />Contacto</div>
          <div class="row q-col-gutter-md">
            <q-input outlined label="Numero de Telefone" dense ref="phoneNumberRef" mask="#########" fill-mask="#"
                     hint="Formato: #########" v-model="user.employee.phoneNumber" class="col-4"
                     :rules="[(val) => isValidPhoneNumber(val) || 'Por favor indicar um contacto válido.']" />
            <q-input outlined label="Email" dense ref="emailRef" class="col-4"
                     :rules="[(val) => isValidEmail(val) || 'Email inválido']"
                     v-model="user.employee.email" />
          </div>
        </q-card-section>

        <!-- Credenciais -->
        <q-card-section class="q-pt-sm">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="lock_outline" size="sm" class="q-mr-xs" />Credenciais</div>
          <div class="row q-col-gutter-md">
            <q-input outlined label="Nome do Utilizador" dense ref="usernameRef"
                     :rules="[(val) => !!val || 'Por favor indicar o nome']" lazy-rules
                     class="col" v-model="user.username" />
            <q-select
              outlined
              dense
              multiple
              clearable
              counter
              label="Perfil de Acesso"
              class="col"
              v-model="user.roles"
              :options="roles"
              option-value="id"
              :option-label="getRoleLabel"
              ref="roleRef"
              :rules="[(val) => (val && val.length > 0) || 'Por favor indicar o Perfil']"
            />

          </div>
        </q-card-section>

        <!-- Informação Laboral -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="engineering" size="sm" class="q-mr-xs" />Informação Laboral</div>
          <div class="row q-col-gutter-md">
            <q-select outlined dense label="Categoria Profissional" class="col"
                      v-model="user.employee.professionalCategory" :options="filterRedCategories"
                      option-value="id" option-label="description" ref="categoryRef" @filter="filterCategories"
                      :rules="[(val) => !!val || 'Por favor indicar a categoria profissional']" />
            <q-input outlined dense label="Ano de Formação" class="col" ref="trainingYearRef" mask="####"
                     fill-mask="#" v-model="user.employee.trainingYear"
                     :rules="[(val) => isValidTrainingYear(val) || 'Ano de formação inválido']" />
            <q-select outlined dense label="Vínculo Laboral" class="col" ref="vinculoRef"
                      v-model="selectedUserLaborInfo" :options="userLaborInfo"
                      :rules="[(val) => !!val || 'Por favor indicar o Vínculo Laboral']" />
          </div>
          <div v-if="isPartnerUser" class="row q-col-gutter-md q-mt-sm">
            <q-select outlined dense label="Nome da ONG" class="col" ref="partnerRef"
                      v-model="user.employee.partner" :options="filterRedPartners"
                      option-value="id" option-label="description" @filter="filterPartners"
                      :rules="[(val) => !!val || 'Por favor indicar o Nome da ONG']" />
          </div>
        </q-card-section>

        <!-- Localização -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="local_hospital" size="sm" class="q-mr-xs" />Unidade Sanitária</div>
          <div class="row q-col-gutter-md">
            <q-select outlined dense label="Província" class="col" ref="provinceRef"
                      v-model="user.employee.locations[0].province" :options="provinces"
                      option-value="id" option-label="designation" @update:model-value="onChangeProvincia()" />
            <q-select outlined dense label="Distrito" class="col" ref="districtRef"
                      v-model="user.employee.locations[0].district" :options="filterRedDistricts"
                      option-value="id" option-label="description" @filter="filterDistricts"
                      :rules="[(val) => !!val || 'Por favor indicar o Distrito']"
                      @update:model-value="onChangeDistrito" />
            <q-select
              outlined dense label="Unidade Sanitária" class="col"
              v-model="user.employee.locations[0].healthFacility"
              :options="filterRedHealthFacilities"
              option-value="id" option-label="healthFacility"
              ref="hfRef"
              @filter="filterHealthFacilities"
            />
          </div>
        </q-card-section>

        <!-- Estado -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle2 q-mb-sm"><q-icon name="info" size="sm" class="q-mr-xs" />Estado do Utilizador</div>
          <q-select outlined dense label="Status" ref="statusRef"
                    v-model="user.lifeCycleStatus" :options="statuses"
                    :rules="[(val) => !!val || 'Por favor indicar o Status']" />
        </q-card-section>

        <q-card-section class="row justify-end q-gutter-sm">
          <q-btn label="Cancelar" color="red" @click="$emit('cancel')" />
          <q-btn label="Submeter" color="primary" @click="submitForm()" />
        </q-card-section>

      </q-card>
    </form>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useProvinceStore } from 'src/stores/province/ProvinceStore';
import { useDistrictStore } from 'src/stores/district/DistrictStore';
import { useHealthFacilityStore } from 'src/stores/healthFacility/HealthFacilityStore';
import { useProfessionalCategoryStore } from 'src/stores/professionalCategory/ProfessionalCategoryStore';
import { usePartnerStore } from 'src/stores/partner/PartnerStore';
import { useUserStore } from 'src/stores/user/UserStore';
import { useRoleStore } from 'src/stores/role/RoleStore';

import { useStringUtils } from 'src/composables/shared/stringutils/stringUtils';
import { Loading, QSpinnerRings } from 'quasar';
import { listActiveAndInactiveLifeCycleStatuses } from 'src/utils/LifeCycleStatus';
import useUser from 'src/composables/user/userMethods';
import { useLoading } from 'src/composables/shared/loading/loading'
import { User } from 'src/entities/user/User';
import { Employee } from 'src/entities/employee/Employee';
import { Location } from 'src/entities/location/Location';
import { cloneDeep } from 'lodash';

// 👇 Definindo props explicitamente
const props = defineProps({
  modelValue: Object,
  selectedUser: Object // <-- Esta linha é essencial!
})


const emit = defineEmits(['close', 'cancel'])

const user = ref(new User({
  employee: new Employee({
    locations: [{ location: new Location() }]
  })
}))

const { alertSucess, alertError } = useSwal();
const { createDTOFromUser } = useUser();
const { stringContains } = useStringUtils();

const provinceStore = useProvinceStore();
const districtStore = useDistrictStore();
const healthFacilityStore = useHealthFacilityStore();
const professionalCategoryStore = useProfessionalCategoryStore();
const partnerStore = usePartnerStore();
const roleStore = useRoleStore();
const userStore = useUserStore();

const provinces = computed(() => provinceStore.getAllProvincesAcrossPages());
const categories = computed(() => professionalCategoryStore.getAllCategoriesAcrossPages());
const partners = computed(() => partnerStore.getAllPartnersAcrossPages().filter(p => p.name !== 'MISAU'));
const districts = computed(() => {
  const provinceId = user.value.employee.locations[0].province?.id;
  if (!provinceId) return [];
  return districtStore.getAllDistrictsAcrossPages().filter((d) => d.province?.id === provinceId);
});
const healthFacilities = computed(() => healthFacilityStore.currentPageHealthFacilities);
const statuses = ref(listActiveAndInactiveLifeCycleStatuses());
const userLaborInfo = ref(['SNS', 'ONG']);
const selectedUserLaborInfo = ref('');
const isPartnerUser = computed(() => selectedUserLaborInfo.value === 'ONG');
const roles = computed(() =>
  roleStore.getAllRolesAcrossPages()
)

const filterRedDistricts = ref([]);
const filterRedHealthFacilities = ref([]);
const filterRedCategories = ref([]);
const filterRedPartners = ref([]);

const filterItems = (source, key, val, update, targetRef) => {
  const filtered = val === ''
    ? [...source.value]
    : source.value.filter((item) =>
        item[key]?.toLowerCase().includes(val.toLowerCase())
      );

  targetRef.value = filtered;
  update(() => filtered);
};

const filterDistricts = (val, update) => filterItems(districts, 'description', val, update, filterRedDistricts);
const filterHealthFacilities = (val, update) => filterItems(healthFacilities, 'healthFacility', val, update, filterRedHealthFacilities);
const filterCategories = (val, update) => filterItems(categories, 'description', val, update, filterRedCategories);
const filterPartners = (val, update) => filterItems(partners, 'description', val, update, filterRedPartners);

const getRoleLabel = (role: any) => {
  if (!role) return ''
  return `${role.description} (${role.level})`
}

const nameRef = ref(null);
const surnameRef = ref(null);
const nuitRef = ref(null);
const phoneNumberRef = ref(null);
const emailRef = ref(null);
const usernameRef = ref(null);
const categoryRef = ref(null);
const trainingYearRef = ref(null);
const vinculoRef = ref(null);
const partnerRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);
const hfRef = ref(null);
const myForm = ref(null);
const partnerRefHasError = ref(false);

const { closeLoading, showloading } = useLoading()

const isValidEmail = (email) => /^[A-Za-z0-9+_.-]+@(.+)$/.test(email);
const isValidNuit = (nuit) => nuit !== '' && !stringContains(nuit, '#');
const isValidPhoneNumber = (phoneNumber) => phoneNumber !== '' && !stringContains(phoneNumber, '_');
const isValidTrainingYear = (year) => year >= 1960 && year <= new Date().getFullYear();

onMounted(() => {
  showloading();
  init().then(() => {
    filterRedCategories.value = categories.value;
    filterRedDistricts.value = districts.value;
    filterRedPartners.value = partners.value;
    filterRedHealthFacilities.value = healthFacilities.value;

    if (props.selectedUser) {
      user.value = new User(cloneDeep(props.selectedUser));
      if (!user.value.employee?.locations || user.value.employee.locations.length === 0) {
        user.value.employee.locations = [{ location: new Location() }];
      }

      selectedUserLaborInfo.value =
        user.value.employee.partner?.name === 'MISAU' ? 'SNS' : 'ONG';

      const districtId = user.value.employee.locations[0].district?.id;
      if (districtId) {
        healthFacilityStore.fetchByDistrictId(districtId);
      }
    }
  });
});

const init = async () => {
  try {
    await Promise.all([
      districtStore.fetchDistricts(),
      provinceStore.fetchProvinces(),
      professionalCategoryStore.fetchCategories(),
      partnerStore.fetchPartners(),
      roleStore.fetchAllRoles()
      
    ])
  } finally {
    closeLoading()
  }
}

const submitForm = async () => {
  nameRef.value.validate();
  surnameRef.value.validate();
  nuitRef.value.validate();
  phoneNumberRef.value.validate();
  emailRef.value.validate();
  usernameRef.value.validate();
  categoryRef.value.validate();
  trainingYearRef.value.validate();
  vinculoRef.value.validate();
  if (isPartnerUser.value) partnerRef.value?.validate();
  provinceRef.value.validate();
  districtRef.value.validate();
  hfRef.value.validate();

  partnerRefHasError.value = isPartnerUser.value && partnerRef.value?.hasError === true;

  const hasError = [
    nameRef, surnameRef, nuitRef, phoneNumberRef, emailRef,
    usernameRef, categoryRef, trainingYearRef, vinculoRef,
    provinceRef, districtRef, hfRef
  ].some(r => r.value?.hasError === true) || partnerRefHasError.value;

  if (hasError) return;

  Loading.show({ spinner: QSpinnerRings });

  try {
    const savedUser = await userStore.saveUser(user.value);
    await alertSucess(props.selectedUser?.id
      ? 'Utilizador actualizado.'
      : 'Utilizador registado com sucesso');
    emit('close');
  } catch (err) {
    console.error(err);
    alertError('Erro ao salvar o utilizador.');
  } finally {
    Loading.hide();
  }
};


const cancel = () => emit('cancel');

const onChangeProvincia = () => {
  user.value.employee.locations[0].district = '';
  user.value.employee.locations[0].healthFacility = '';
};

const onChangeDistrito = async (district) => {
  user.value.employee.locations[0].healthFacility = '';
  if (district?.id) {
    await healthFacilityStore.fetchByDistrictId(district.id);
  }
};

const onChangeVinculo = async (selected) => {
  if (selected === 'SNS') {
    user.value.employee.partner = await partnerStore.getByName('MISAU');
  } else {
    user.value.employee.partner = '';
  }
};

const onChangeStatus = () => {
  //
}
</script>

<style scoped></style>


<style></style>
