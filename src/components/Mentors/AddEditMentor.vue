<template>
  <div>
    <div class="q-ma-md page-container">
      <form @submit.prevent="submitForm" ref="myForm">
        <div class="q-ma-md">
          <q-banner dense inline-actions class="text-white bg-primary q-px-md">
            Dados do Mentor
            <template v-slot:action>
              <q-img src="~assets/mentoring.png" />
            </template>
          </q-banner>
          <div class="page-input-container q-pa-md">
            <div class="q-mt-lg">
              <div class="row items-center q-mb-md">
                <q-icon name="person_outline" size="sm" />
                <span class="q-pl-sm text-subtitle2"
                  >Identificação do Mentor</span
                >
              </div>
              <q-separator color="grey-13" size="1px" />
            </div>
            <div class="row q-my-sm">
              <q-input
                outlined
                label="Nome"
                dense
                ref="nameRef"
                :rules="[(val) => !!val || 'Por favor indicar o nome']"
                lazy-rules
                class="col"
                v-model="mentor.employee.name"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.name = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
              <q-input
                outlined
                label="Apelido"
                dense
                :rules="[(val) => !!val || 'Por favor indicar o apelido']"
                lazy-rules
                ref="surnameRef"
                class="col q-ml-md"
                v-model="mentor.employee.surname"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.surname = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </div>
            <div class="row q-my-sm q-mt-md">
              <q-input
                outlined
                label="NUIT"
                dense
                ref="nuitRef"
                class="col"
                mask="#########"
                lazy-rules
                :rules="[
                  (val) =>
                    isValidNuit(val) || 'Por favor indicar um NUIT válido.',
                ]"
                fill-mask="#"
                v-model="mentor.employee.nuit"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.nuit = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
              <span class="col" />
            </div>
            <div class="q-mt-lg">
              <div class="row items-center q-mb-md">
                <q-icon name="call" size="sm" />
                <span class="q-pl-sm text-subtitle2">Contacto</span>
              </div>
              <q-separator color="grey-13" size="1px" />
            </div>
            <div class="row q-my-sm">
              <q-input
                outlined
                label="Numero de Telefone"
                dense
                ref="phoneNumberRef"
                mask="#########"
                hint="Formato: #########"
                lazy-rules
                :rules="[
                  (val) =>
                    isValidPhoneNumber(val) ||
                    'Por favor indicar um contacto válido.',
                ]"
                fill-mask="#"
                class="col"
                v-model="mentor.employee.phoneNumber"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.phoneNumber = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>

              <q-input
                outlined
                label="Email"
                dense
                ref="emailRef"
                class="col q-ml-md"
                :rules="[(val) => isValidEmail(val) || 'Email inválido']"
                lazy-rules
                v-model="mentor.employee.email"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.email = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </div>
            <div class="q-mt-lg">
              <div class="row items-center q-mb-md">
                <q-icon name="engineering" size="sm" />
                <span class="q-pl-sm text-subtitle2">Informação Laboral</span>
              </div>
              <q-separator color="grey-13" size="1px" />
            </div>
            <div class="row q-my-sm">
              <q-select
                class="col"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="categoryRef"
                :rules="[
                  (val) =>
                    !!val || 'Por favor indicar a categoria profissional',
                ]"
                lazy-rules
                v-model="mentor.employee.professionalCategory"
                :options="filterRedCategories"
                option-value="id"
                option-label="description"
                @filter="filterCategories"
                label="Categoria Profissional"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sem Resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input
                outlined
                label="Ano de Formação"
                dense
                ref="trainingYearRef"
                :rules="[
                  (val) =>
                    isValidTrainingYear(val) || 'Ano de formação inválido',
                  (val) => isMinYear(val) || 'Ano tem que ser superior a 1960',
                  (val) =>
                    isMaxYear(val) ||
                    'Ano nao pode ser superior ao Ano Atual ' +
                      new Date().getFullYear(),
                ]"
                lazy-rules
                mask="####"
                fill-mask="#"
                class="col q-ml-md"
                v-model="mentor.employee.trainingYear"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentor.employee.trainingYear = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>

              <q-select
                class="col q-ml-md"
                use-input
                hide-selected
                @update:model-value="onChangeVinculo"
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="vinculoRef"
                lazy-rules
                :rules="[
                  (val) => !!val || 'Por favor indicar o Vínculo Laboral',
                ]"
                v-model="selectedMentorLaborInfo"
                :options="mentorLaborInfo"
                label="Vínculo Laboral"
              />
            </div>
            <div class="row q-my-sm">
              <q-select
                v-if="isPartnerMentor"
                class="col-4"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="partnerRef"
                lazy-rules
                :rules="[(val) => !!val || 'Por favor indicar o Nome da ONG']"
                v-model="mentor.employee.partner"
                :options="filterRedPartners"
                option-value="id"
                option-label="description"
                @filter="filterPartners"
                label="Nome da ONG"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sem Resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-mt-lg">
              <div class="row items-center q-mb-md">
                <q-icon name="local_hospital" size="sm" />
                <span class="q-pl-sm text-subtitle2">Unidade Sanitária</span>
              </div>
              <q-separator color="grey-13" size="1px" />
            </div>
            <div class="row q-my-sm">
              <q-select
                class="col"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @update:model-value="onChangeProvincia"
                dense
                outlined
                ref="provinceRef"
                lazy-rules
                :rules="[(val) => !!val || 'Por favor indicar a Província']"
                v-model="mentor.employee.locations[0].province"
                :options="provinces"
                option-value="id"
                option-label="designation"
                label="Província"
              />

              <q-select
                class="col q-ml-md"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="districtRef"
                lazy-rules
                :rules="[(val) => !!val || 'Por favor indicar o Distrito']"
                v-model="mentor.employee.locations[0].district"
                :options="filterRedDistricts"
                option-value="id"
                option-label="description"
                @filter="filterDistricts"
                @update:model-value="onChangeDistrito"
                label="Distrito"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sem Resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select
                class="col q-ml-md"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="hfRef"
                lazy-rules
                :rules="[
                  (val) => !!val || 'Por favor indicar a Unidade Sanitária',
                ]"
                v-model="mentor.employee.locations[0].healthFacility"
                :options="filterRedHealthFacilities"
                option-value="id"
                option-label="healthFacility"
                @filter="filterHealthFacilities"
                label="Unidade Sanitária"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sem Resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="row q-my-sm">
              <q-space />
              <q-btn
                label="Cancelar"
                class="float-right"
                color="red"
                type="button"
                @click="cancel"
              />
              <q-btn
                class="float-right q-ml-md"
                type="submit"
                label="Submeter"
                color="primary"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
// Imports
import { inject, ref, computed, onMounted, watch } from 'vue';
import Mentor from 'src/stores/model/mentor/Mentor';
import Employee from 'src/stores/model/employee/Employee';
import Location from 'src/stores/model/location/Location';
import { useStringUtils } from 'src/composables/shared/stringutils/stringUtils';
import useMentor from 'src/composables/mentor/mentorMethods';
import mentorService from 'src/services/api/mentor/mentorService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { Loading, QSpinnerRings } from 'quasar';
import { useProvinceStore } from 'src/stores/province/ProvinceStore';
import { useDistrictStore } from 'src/stores/district/DistrictStore';
import { useHealthFacilityStore } from 'src/stores/healthFacility/HealthFacilityStore';
import { useProfessionalCategoryStore } from 'src/stores/professionalCategory/ProfessionalCategoryStore';
import { usePartnerStore } from 'src/stores/partner/PartnerStore';
import partnerService from 'src/services/api/partner/partnerService';

// Stores
const provinceStore = useProvinceStore();
const districtStore = useDistrictStore();
const healthFacilityStore = useHealthFacilityStore();
const professionalCategoryStore = useProfessionalCategoryStore();
const partnerStore = usePartnerStore();

// State
const mentor = ref(new Mentor({ employee: new Employee({ locations: [{ location: new Location() }] }) }));
const emit = defineEmits(['goToMentoringAreas', 'close']);
const { createDTOFromMentor, createMentorFromDTO } = useMentor();
const { stringContains } = useStringUtils();
const { alertSucess, alertError, alertSucessAction } = useSwal();

const filterRedDistricts = ref([]);
const filterRedHealthFacilities = ref([]);
const filterRedCategories = ref([]);
const filterRedPartners = ref([]);
const selectedMentorLaborInfo = ref('');
const mentorLaborInfo = ref(['SNS', 'ONG']);
const partnerRefHasError = ref(true);

// Form Refs
const nameRef = ref(null);
const surnameRef = ref(null);
const nuitRef = ref(null);
const phoneNumberRef = ref(null);
const emailRef = ref(null);
const categoryRef = ref(null);
const trainingYearRef = ref(null);
const vinculoRef = ref(null);
const partnerRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);
const hfRef = ref(null);
const myForm = ref(null);

// Props
const selectedMentor = inject('selectedMentor');
const step = inject('step');
const isEditStep = computed(() => step.value === 'edit');
const mentorLocations = ref([]);

onMounted(() => {
  if (isEditStep.value) {
    mentor.value = Object.assign({}, selectedMentor.value);
    selectedMentorLaborInfo.value = mentor.value.employee.partner?.name === 'MISAU' ? 'SNS' : 'ONG';
    healthFacilityStore.fetchByDistrictId(mentor.value.employee.locations[0].district?.id);
  }
});


// Computed
const isPartnerMentor = computed(() => selectedMentorLaborInfo.value === 'ONG');
const provinces = computed(() => provinceStore.getAllProvincesAcrossPages());
const categories = computed(() => professionalCategoryStore.getAllCategoriesAcrossPages());
const partners = computed(() =>
  partnerStore.getAllPartnersAcrossPages().filter(p => p.name !== 'MISAU')
)


const districts = computed(() => {
  const provinceId = mentor.value.employee.locations[0].province?.id;
  if (!provinceId) return [];
  return districtStore.getAllDistrictsAcrossPages().filter((district) => district.province?.id === provinceId);
});

const healthFacilities = computed(() => healthFacilityStore.currentPageHealthFacilities);

// Validações
const isValidEmail = (email) => /^[A-Za-z0-9+_.-]+@(.+)$/.test(email);
const isValidNuit = (nuit) => nuit !== '' && !stringContains(nuit, '#');
const isValidTrainingYear = (year) => year >= 1960 && year !== '' && !stringContains(year, '#');
const isMinYear = (year) => year >= 1960;
const isMaxYear = (year) => year <= new Date().getFullYear();
const isValidPhoneNumber = (phoneNumber) => phoneNumber !== '' && !stringContains(phoneNumber, '_');

// Handlers
const submitForm = () => {
  nameRef.value.validate();
  surnameRef.value.validate();
  nuitRef.value.validate();
  phoneNumberRef.value.validate();
  emailRef.value.validate();
  categoryRef.value.validate();
  trainingYearRef.value.validate();
  vinculoRef.value.validate();
  if (!mentor.value.employee.partner) partnerRef.value?.validate();
  if (mentor.value.employee.partner) partnerRefHasError.value = partnerRef.value?.hasError;
  provinceRef.value.validate();
  districtRef.value.validate();
  hfRef.value.validate();

  if (
    !nameRef.value.hasError &&
    !surnameRef.value.hasError &&
    !phoneNumberRef.value.hasError &&
    !emailRef.value.hasError &&
    !categoryRef.value.hasError &&
    !trainingYearRef.value.hasError &&
    !vinculoRef.value.hasError &&
    !provinceRef.value.hasError &&
    !districtRef.value.hasError &&
    !hfRef.value.hasError &&
    !partnerRefHasError.value
  ) {
    Loading.show({ spinner: QSpinnerRings });
    const target_copy = Object.assign({}, mentor.value);
    const dto = createDTOFromMentor(new Mentor(target_copy));

    const action = isEditStep.value ? mentorService.update(dto) : mentorService.save(dto);
    action.then((resp) => {
      if (resp.status === 200 || resp.status === 201) {
        if (isEditStep.value) {
          alertSucess('Mentor actualizado.').then(() => emit('close'));
        } else {
          alertSucessAction('Mentor criado com sucesso, avançar para áreas de mentória').then((result) => {
            if (result) {
              selectedMentor.value = createMentorFromDTO(resp.data);
              emit('goToMentoringAreas', selectedMentor.value);
            } else {
              emit('close');
            }
          });
        }
      } else {
        alertError(resp.response?.data?.message || resp.message);
      }
      Loading.hide();
    }).catch((err) => {
      console.error(err);
      Loading.hide();
    });
  }
};

const onChangeProvincia = () => {
  mentor.value.employee.locations[0].district = '';
  mentor.value.employee.locations[0].healthFacility = '';
};

const onChangeDistrito = async (district) => {
  mentor.value.employee.locations[0].healthFacility = '';
  if (district?.id) {
    await healthFacilityStore.fetchByDistrictId(district.id);
  }
};

const onChangeVinculo = async (selected) => {
  if (selected === 'SNS') {
    mentor.value.employee.partner = await partnerService.getByName('MISAU');
  } else {
    mentor.value.employee.partner = '';
  }
};

const cancel = () => emit('close');

const filterItems = (source, key, val, update, targetRef) => {
  if (val === '') {
    update(() => {
      targetRef.value = source.value.map((item) => item);
    });
  } else {
    update(() => {
      targetRef.value = source.value.filter((item) =>
        item[key].toLowerCase().includes(val.toLowerCase())
      );
    });
  }
};

const filterDistricts = (val, update) => filterItems(districts, 'description', val, update, filterRedDistricts);
const filterHealthFacilities = (val, update) => filterItems(healthFacilities, 'healthFacility', val, update, filterRedHealthFacilities);
const filterCategories = (val, update) => filterItems(categories, 'description', val, update, filterRedCategories);
const filterPartners = (val, update) => filterItems(partners, 'description', val, update, filterRedPartners);
</script>
<style></style>
