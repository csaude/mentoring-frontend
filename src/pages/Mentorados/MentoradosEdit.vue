<template>
  <div>
    <div class="q-ma-md page-container">
      <form @submit.prevent="submitForm" ref="myForm">
        <div class="q-ma-md">
          <q-banner dense inline-actions class="text-white bg-primary q-px-md">
            Dados do Mentorado
            <template v-slot:action>
              <q-img src="~assets/mentoring.png" />
            </template>
          </q-banner>
          <div class="page-input-container q-pa-md">
            <div class="q-mt-lg">
              <div class="row items-center q-mb-md">
                <q-icon name="person_outline" size="sm" />
                <span class="q-pl-sm text-subtitle2"
                  >Identificação do Mentorado</span
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
                v-model="mentorado.employee.name"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.name = ''"
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
                v-model="mentorado.employee.surname"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.surname = ''"
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
                v-model="mentorado.employee.nuit"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.nuit = ''"
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
                mask="+2588#######"
                hint="Formato: +2588#######"
                lazy-rules
                :rules="[
                  (val) =>
                    isValidPhoneNumber(val) ||
                    'Por favor indicar um contacto válido.',
                ]"
                fill-mask="_"
                class="col"
                v-model="mentorado.employee.phoneNumber"
                @update:mentorado-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.phoneNumber = ''"
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
                v-model="mentorado.employee.email"
                @update:mentorado-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.email = ''"
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
                v-model="mentorado.employee.professionalCategory"
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
                ]"
                lazy-rules
                mask="####"
                fill-mask="#"
                class="col q-ml-md"
                v-model="mentorado.employee.trainingYear"
                @update:model-value="(value) => (filter = value)"
              >
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click="mentorado.employee.trainingYear = ''"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>

              <q-select
                class="col q-ml-md"
                use-input
                hide-selected
                @update:model-value="(val) => onChangeVinculo(val)"
                fill-input
                input-debounce="0"
                dense
                outlined
                ref="vinculoRef"
                lazy-rules
                :rules="[
                  (val) => !!val || 'Por favor indicar o Vínculo Laboral',
                ]"
                v-model="selectedMentoradoLaborInfo"
                :options="mentoradoLaborInfo"
                label="Vínculo Laboral"
              />
            </div>
            <div class="row q-my-sm">
              <q-select
                v-if="isPartnerMentorado"
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
                v-model="mentorado.employee.partner"
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
                @update:model-value="onChangeProvincia()"
                dense
                outlined
                ref="provinceRef"
                lazy-rules
                :rules="[(val) => !!val || 'Por favor indicar a Província']"
                v-model="mentorado.employee.locations[0].province"
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
                v-model="mentorado.employee.locations[0].district"
                :options="filterRedDistricts"
                option-value="id"
                option-label="description"
                @filter="filterDistricts"
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
                v-model="mentorado.employee.locations[0].healthFacility"
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
                to="/mentorados"
              />
              <q-btn
                class="float-right q-ml-md"
                type="submit"
                :loading="submitLoading"
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
import { inject, ref, computed, onMounted } from 'vue';
import Mentorados from 'src/stores/model/mentorados/Mentorados';
import Employee from 'src/stores/model/employee/Employee';
import provinceService from 'src/services/api/province/provinceService';
import districtService from 'src/services/api/district/districtService';
import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
import professionalCategoryService from 'src/services/api/professionalcategory/professionalCategoryService';
import Location from 'src/stores/model/location/Location';
import { useStringUtils } from 'src/composables/shared/stringutils/stringUtils';
import partnerService from 'src/services/api/partner/partnerService';
import userMentorados from 'src/composables/mentorados/mentoradosMethods';
import mentoradosService from 'src/services/api/mentorados/mentoradosService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useRouter, useRoute } from 'vue-router';
import mentorService from 'src/services/api/mentor/mentorService';

const mentorado = ref(
  new Mentorados({
    employee: new Employee({
      locations: [
        {
          location: new Location(),
        },
      ],
    }),
  })
);

const emit = defineEmits(['Mentorados', 'close']);

const { createDTOFromMentorado } = userMentorados();
const { stringContains } = useStringUtils();
const { alertSucess, alertError, alertSucessAction } = useSwal();
const filterRedDistricts = ref([]);
const filterRedHealthFacilities = ref([]);
const filterRedCategories = ref([]);
const filterRedPartners = ref([]);
const selectedMentoradoLaborInfo = ref('');
const mentoradoLaborInfo = ref(['SNS', 'ONG']);
const location = ref(new Location());

//Ref's
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

const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (route.params.id) {
    mentorado.value = mentoradosService.getById(route.params.id);
    console.log(mentorado.value);
  }
});

const provinces = computed(() => {
  provinceService.getAll();
  return provinceService.piniaGetAll();
});

const isPartnerMentorado = computed(() => {
  return selectedMentoradoLaborInfo.value === 'ONG';
});

const categories = computed(() => {
  return professionalCategoryService.piniaGetAll();
});

const districts = computed(() => {
  if (
    mentorado.value.employee.locations[0].province !== null &&
    mentorado.value.employee.locations[0].province !== undefined
  ) {
    districtService.getAll();
    console.log(districtService.getAll());
    return districtService.getAllDistrictByProvinceId(
      mentorado.value.employee.locations[0].province.id
    );
  } else {
    return null;
  }
});

const partners = computed(() => {
  return partnerService.piniaGetAll();
});

const myForm = ref(null);

const submitForm = () => {
  nameRef.value.validate();
  surnameRef.value.validate();
  nuitRef.value.validate();
  phoneNumberRef.value.validate();
  emailRef.value.validate();
  categoryRef.value.validate();
  trainingYearRef.value.validate();
  vinculoRef.value.validate();
  if (partnerRef.value !== null) partnerRef.value.validate();
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
    !hfRef.value.hasError
  ) {
    const target_copy = Object.assign({}, mentorado.value);
    mentoradosService
      .update(createDTOFromMentorado(new Mentorados(target_copy)))
      .then((resp) => {
        alertSucessAction('Mentorado Actualizado com sucesso,').then(
          (result) => {
            if (result) {
              route.push({ name: 'mentorados' });
            }
          }
        );
      })
      .catch((error) => {
        console.log('Error', error.message);
        alertError('Ocorreu um erro inesperado nesta operação.');
      });
  }
};
const isValidEmail = (email) => {
  const regex = /^[A-Za-z0-9+_.-]+@(.+)$/;
  return regex.test(email);
};
const isValidNuit = (nuit) => {
  return nuit !== '' && !stringContains(nuit, '#');
};

const isValidTrainingYear = (year) => {
  return year !== '' && !stringContains(year, '#');
};

const isValidPhoneNumber = (phoneNumber) => {
  return phoneNumber !== '' && !stringContains(phoneNumber, '_');
};

const filterPartners = (val, update, abort) => {
  const stringOptions = partners;
  if (val === '') {
    update(() => {
      filterRedPartners.value = stringOptions.value.map((partner) => partner);
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedPartners.value = [];
    });
  } else {
    update(() => {
      filterRedPartners.value = stringOptions.value
        .map((partner) => partner)
        .filter((partner) => {
          return (
            partner &&
            partner.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const filterDistricts = (val, update, abort) => {
  const stringOptions = districts;
  if (val === '') {
    update(() => {
      filterRedDistricts.value = stringOptions.value.map(
        (district) => district
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedDistricts.value = [];
    });
  } else {
    update(() => {
      filterRedDistricts.value = stringOptions.value
        .map((district) => district)
        .filter((district) => {
          return (
            district &&
            district.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const healthFacilities = computed(() => {
  if (
    mentorado.value.employee.locations[0].district !== null &&
    mentorado.value.employee.locations[0].district !== undefined
  ) {
    healthFacilityService.getAll();
    return healthFacilityService.getAllOfDistrict(
      mentorado.value.employee.locations[0].district.id
    );
  } else {
    return null;
  }
});

const filterHealthFacilities = (val, update, abort) => {
  const stringOptions = healthFacilities;
  if (val === '') {
    update(() => {
      filterRedHealthFacilities.value = stringOptions.value.map(
        (healthFacility) => healthFacility
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedHealthFacilities.value = [];
    });
  } else {
    update(() => {
      filterRedHealthFacilities.value = stringOptions.value
        .map((healthFacility) => healthFacility)
        .filter((healthFacility) => {
          return (
            healthFacility &&
            healthFacility.healthFacility
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const filterCategories = (val, update, abort) => {
  const stringOptions = categories;
  if (val === '') {
    update(() => {
      filterRedCategories.value = stringOptions.value.map(
        (category) => category
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedCategories.value = [];
    });
  } else {
    update(() => {
      filterRedCategories.value = stringOptions.value
        .map((category) => category)
        .filter((category) => {
          return (
            category &&
            category.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const step = inject('step');
const init = () => {
  mentorado.value.employee.locations.push(location);
};

const onChangeProvincia = () => {
  mentorado.value.employee.locations[0].district = '';
  mentorado.value.employee.locations[0].district = '';
};
const cancel = () => {
  emit('close');
};

const onChangeVinculo = (selected) => {
  if (selected === 'SNS') {
    mentorado.value.employee.partner = partnerService.getByName('MISAU');
  } else {
    mentorado.value.employee.partner = '';
  }
};
</script>
<style></style>
