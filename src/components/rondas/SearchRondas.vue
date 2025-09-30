<template>
  <div class="q-pt-sm" style="height: 100%">
    <div class="q-ma-md q-pa-md page-container">
      <div class="row">
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
          v-model="selectedProvince"
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
          @update:model-value="onChangeDistrict"
          dense
          outlined
          ref="districtRef"
          v-model="selectedDistrict"
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
          ref="usRef"
          v-model="selectedUS"
          :options="unidadesSanitarias"
          option-value="id"
          option-label="healthFacility"
          @filter="filterUSs"
          @update:model-value="onChangeHealthFacility"
          label="Unidade Sanitaria"
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
          ref="mentorRef"
          v-model="selectedMentor"
          :options="filteredMentors"
          option-value="id"
          option-label="fullName"
          label="Mentor"
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
          label="Data Inicio DD-MM-AAAA"
          dense
          ref="dataInicioRef"
          format="DD-MM-YYYY"
          class="col q-ml-md"
          v-model="startDate"
          @update:model-value="(value) => (filter = value)"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="startDate" mask="DD-MM-YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          outlined
          label="Data Fim DD-MM-AAAA"
          dense
          ref="dataFimRef"
          format="DD-MM-YYYY"
          class="col q-ml-md"
          v-model="endDate"
          @update:model-value="(value) => (filter = value)"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="endDate" mask="DD-MM-YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-space />
        <q-btn
          @click="search"
          class="q-ml-md q-mb-xs float-right"
          square
          color="primary"
          icon="search"
        >
          <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
        </q-btn>
        <q-btn
          @click="clearSearchParams"
          class="q-ml-md q-mb-xs float-right"
          square
          color="amber"
          icon="clear"
        >
          <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
        </q-btn>
      </div>
      <div class="q-mt-lg q-mb-md">
        <div class="row items-center q-mb-md">
          <q-icon name="search" size="sm" />
          <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
        </div>
        <q-separator color="grey-13" size="1px" />
      </div>
      <div>
        <q-table
          v-if="formattedResult.length > 0"
          class="col"
          dense
          :rows="formattedResult"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div
              class="full-width row flex-center text-primary q-gutter-sm text-body2"
            >
              <span>Sem resultados para visualizar</span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <q-td key="description" :props="props">{{
                props.row.description
              }}</q-td>
              <q-td key="startDate" :props="props">{{
                formatDate(props.row.startDate)
              }}</q-td>
              <q-td key="endDate" :props="props">{{
                formatDate(props.row.endDate)
              }}</q-td>
              <q-td key="healthFacility" :props="props">
                {{ props.row.healthFacility ? props.row.healthFacility : '-' }}
              </q-td>
              <q-td key="mentor" :props="props">
                {{ fullName(props.row.employee) }}
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn
                  v-if="!reportMode"
                  flat
                  round
                  class="q-ml-md"
                  color="yellow-8"
                  icon="edit"
                  @click="editRonda(props.row.ronda)"
                >
                  <q-tooltip class="bg-green-5">Editar Ronda</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  v-if="formattedResult.length > 0 && reportMode"
                  dense
                  color="primary"
                  :loading="loadingReports[props.row.ronda.uuid]"
                  :disable="loadingReports[props.row.ronda.uuid]"
                  icon="print"
                  @click="printReport(props.row.ronda.uuid)"
                >
                  <q-tooltip class="bg-green-5">Imprimir Relatorio</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
  </div>

  <q-dialog persistent v-model="showAditDialog">
    <q-card style="width: 35vw; max-width: 90vw">
      <q-card-section>
        <div class="text-h7 bg-primary q-pa-sm text-white">
          Alteracao do Mentor da Ronda {{ selectedRonda.description }}
        </div>
      </q-card-section>

      <q-card-section bordered class="q-pt-none">
        <div class="row">
          <q-select
            class="col-12 q-mb-sm"
            dense
            outlined
            ref="mentorRef"
            v-model="selectedMentor"
            :options="filteredMentors"
            option-value="id"
            option-label="fullName"
            label="Mentor"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn dense label="Cancelar" color="red" v-close-popup></q-btn>
        <q-btn
          dense
          class="q-mr-sm"
          type="submit"
          color="primary"
          label="Gravar"
          @click="gravar()"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import useEmployee from 'src/composables/employee/employeeMethods';
import mentorService from 'src/services/api/mentor/mentorService';
import Mentor from 'src/stores/model/mentor/Mentor';
import Employee from 'src/stores/model/employee/Employee';
import User from 'src/stores/model/user/User';
import { onMounted, ref, inject, computed } from 'vue';
import UsersService from 'src/services/api/user/UsersService';
import useMentor from 'src/composables/mentor/mentorMethods';
import provinceService from 'src/services/api/province/provinceService';
import districtService from 'src/services/api/district/districtService';
import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
import rondaService from 'src/services/api/ronda/rondaService';
import useRonda from 'src/composables/ronda/rondaMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import rondasReport from 'src/printables/rondasReport/rondasReport';
import { useLoading } from 'src/composables/shared/loading/loading';
import sessionService from 'src/services/api/session/sessionService';

const { closeLoading, showloading } = useLoading();

const { createMentorFromDTO } = useMentor();
const searchParams = ref(
  new Mentor({
    employee: new Employee(),
  })
);
const reportMode = inject('reportMode');
const showAditDialog = ref(false);
const selectedRonda = ref(null);
const selectedMentor = ref(null);
const { fullName } = useEmployee();
const step = inject('step');
const searchResults = ref([]);
const options = ref([]);
const row = ref(null);
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedUS = ref(null);
const filterRedDistricts = ref([]);
const unidadesSanitarias = ref([]);
const filteredMentors = ref([]);
const startDate = ref(null);
const endDate = ref(null);
const startDateParam = ref(null);
const endDateParam = ref(null);
const userData = JSON.parse(localStorage.getItem('userData'));
const roles = userData.roles;
const healthFacility = ref('');
const loadingReports = ref({});

// Defina as colunas da tabela
const columns = [
  { name: 'description', align: 'left', label: 'Descrição', sortable: false },
  { name: 'startDate', align: 'left', label: 'Data Início', sortable: false },
  { name: 'endDate', align: 'left', label: 'Data Fim', sortable: false },
  {
    name: 'healthFacility',
    align: 'left',
    label: 'Unidade Sanitária',
    sortable: false,
  },
  { name: 'mentor', align: 'left', label: 'Mentor', sortable: false },
  {
    name: 'actions',
    align: 'center',
    label: 'Ações',
    sortable: false,
    field: (row) => row.id,
  },
];

// Formate a data para exibição
const formatDate = (dateStr) => {
  if (!dateStr) return '-';

  // Criando uma data a partir da string
  const date = new Date(dateStr);

  // Ajustando para UTC
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // getUTCMonth() é zero-indexado
  const year = date.getUTCFullYear();

  // Formatando a data no formato pt-BR
  const res = `${String(day).padStart(2, '0')}/${String(month).padStart(
    2,
    '0'
  )}/${year}`;
  return res;
};

const editRonda = async (ronda) => {
  selectedRonda.value = ronda;
  showAditDialog.value = true;

  // Carregar todos os mentores disponíveis
  const mentors = await mentorService.getMentorList();

  // Filtrar o mentor atual da ronda selecionada
  const currentMentor = ronda.rondaMentors[0]?.mentor; // Supondo que rondaMentors é um array com um único mentor
  filteredMentors.value = mentors
    .filter((mentor) => mentor.id !== currentMentor.id) // Filtrar o mentor atual da lista
    .map((mentor) => ({
      ...mentor,
      fullName: `${mentor.employee.name} ${mentor.employee.surname}`,
    }));
};

const printReport = async (uuid) => {
  loadingReports.value[uuid] = true;
  rondaService.generateReport(uuid).then((res) => {
    if (res.status === 200 || res.status === 201) {
      const jsonResult = res.data;
      rondasReport.processAndDownloadReport(
        jsonResult,
        healthFacility.value,
        startDateParam.value,
        endDateParam.value
      );
      loadingReports.value[uuid] = false;
    } else {
      loadingReports.value[uuid] = false;
      useSwal().alertError('Ocorreu algum erro...');
    }
    loadingReports.value[uuid] = false;
  });
};

const gravar = async () => {
  showAditDialog.value = false;
  const confirmation = await useSwal().alertWarningAction(
    'Deseja realmente alterar o mentor da ronda?'
  );

  if (!confirmation) {
    return;
  }
  await rondaService.changeMentor(
    selectedRonda.value.id,
    selectedMentor.value.id
  );
  search();
};

function extractProgrammaticAreasFromRonda(ronda) {
  const areas = new Map();

  if (!ronda.sessions) return [];

  ronda.sessions.forEach((session) => {
    const area = session.form?.programmaticArea;
    if (area && area.code && area.description) {
      areas.set(area.code, {
        code: area.code,
        description: area.description,
      });
    }
  });

  return Array.from(areas.values());
}

const emit = defineEmits(['goToMentoringAreas', 'import', 'edit']);
const currUser = ref(new User());

const onChangeProvincia = () => {
  selectedDistrict.value = null;
  selectedUS.value = null;
  filteredMentors.value = [];
};

const onChangeDistrict = () => {
  selectedUS.value = null;
  filteredMentors.value = [];
};

const onChangeHealthFacility = async () => {
  if (selectedUS.value) {
    const mentors = await mentorService.getMentorsByHealthFacilityId(
      selectedUS.value.id
    );
    filteredMentors.value = mentors.map((mentor) => ({
      ...mentor,
      fullName: `${mentor.employee.name} ${mentor.employee.surname}`,
    }));
  } else {
    filteredMentors.value = [];
  }
};

const mentors = computed(() => {
  return mentorService.getMentorList();
});

const districts = computed(() => {
  if (selectedProvince.value) {
    return districtService.getAllDistrictByProvinceId(
      selectedProvince.value.id
    );
  } else {
    return null;
  }
});

const unidSanitarias = computed(() => {
  if (selectedDistrict.value) {
    return healthFacilityService.getAllOfDistrict(selectedDistrict.value.id);
  } else {
    return [];
  }
});

const formattedResult = computed(() => {
  if (searchResults.value?.length > 0) {
    const res = [];

    searchResults.value.forEach((ronda) => {
      if (reportMode?.value) {
        ronda.rondaMentors.forEach((rm) => {
          if (ronda.endDate) {
            startDateParam.value = ronda.startDate;
            endDateParam.value = ronda.endDate;
            healthFacility.value = ronda.healthFacility.healthFacility;
            res.push({
              description: ronda.description,
              startDate: ronda.startDate,
              endDate: ronda.endDate,
              healthFacility: ronda.healthFacility.healthFacility,
              employee: rm.mentor.employee,
              ronda: ronda,
            });
          }
        });
      } else {
        if (
          Array.isArray(ronda.rondaMentors) &&
          ronda.rondaType?.code &&
          ronda.healthFacility?.healthFacility
        ) {
          // Verifica se endDate é vazio ou null ou undefined, e o tipo é diferente de SESSAO_ZERO
          const hasNoEndDate = ronda.endDate === '';
          const isNotSessaoZero = ronda.rondaType.code !== 'SESSAO_ZERO';

          if (isNotSessaoZero && hasNoEndDate) {
            ronda.rondaMentors.forEach((rm) => {
              if (rm?.mentor?.employee) {
                if (rm.endDate === '')
                  res.push({
                    description: ronda.description,
                    startDate: rm.startDate,
                    endDate: rm.endDate,
                    healthFacility: ronda.healthFacility.healthFacility,
                    employee: rm.mentor.employee,
                    ronda: ronda,
                  });
              }
            });
          }
        }
      }
    });

    return res;
  }

  return [];
});

const filterDistricts = (val, update, abort) => {
  const stringOptions = districts.value;
  if (val === '') {
    update(() => {
      filterRedDistricts.value = stringOptions.map((district) => district);
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      filterRedDistricts.value = [];
    });
  } else {
    update(() => {
      filterRedDistricts.value = stringOptions
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

const filterUSs = (val, update, abort) => {
  const stringOptions = unidSanitarias.value;
  if (val === '') {
    update(() => {
      unidadesSanitarias.value = stringOptions.map((us) => us);
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      unidadesSanitarias.value = [];
    });
  } else {
    update(() => {
      unidadesSanitarias.value = stringOptions
        .map((us) => us)
        .filter((us) => {
          return (
            us &&
            us.healthFacility.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const provinces = computed(() => {
  return provinceService.piniaGetAll();
});

onMounted(() => {
  showloading();
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
  closeLoading();
});

const editMentor = (mentor) => {
  selectedMentor.value = mentor;
  emit('edit', mentor);
};

const search = async () => {
  showloading();
  if (!selectedProvince.value) {
    useSwal().alertError('O campo de província deve ser preenchido');
    return;
  }

  const params = {
    province: selectedProvince.value?.id,
    district: selectedDistrict.value?.id,
    healthFacility: selectedUS.value?.id,
    mentor: selectedMentor.value?.id,
    startDate: startDate.value,
    endDate: endDate.value,
  };

  Object.keys(params).forEach(
    (key) =>
      (params[key] === null || params[key] === undefined) && delete params[key]
  );

  try {
    const response = await rondaService.search(params);
    if ([200, 201].includes(response.status)) {
      const rondasDetalhadas = await Promise.all(
        response.data.map((ronda) => rondaService.getById(ronda.id))
      );
      searchResults.value = rondasDetalhadas;
    } else {
      useSwal().alertError('Algo correu mal na pesquisa.');
    }
    closeLoading();
  } catch (error) {
    closeLoading();
    console.error(error);
    useSwal().alertError('Erro na comunicação com o servidor.');
  }
};

const clearSearchParams = () => {
  selectedProvince.value = null;
  selectedDistrict.value = null;
  selectedUS.value = null;
  selectedMentor.value = null;
  startDate.value = null;
  endDate.value = null;
  searchResults.value = [];
};

const manageMentoringAreas = (mentor) => {
  emit('goToMentoringAreas', mentor);
};
</script>
