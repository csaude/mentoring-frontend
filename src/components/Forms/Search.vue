<template>
  <div class="q-pt-sm" style="height: 100%">
    <div class="q-ma-md q-pa-md page-container">
      <div class="row">
        <!-- Program Select -->
        <q-select
          class="col"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          @update:model-value="onChangePrograma(val)"
          dense
          outlined
          ref="programRef"
          lazy-rules
          v-model="searchParams.program"
          :options="programs"
          option-value="id"
          option-label="name"
          label="Programa"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Sem Resultados
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Programmatic Area Select -->
        <q-select
          class="col q-ml-md"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          ref="programmaticAreaRef"
          lazy-rules
          v-model="searchParams.programmaticArea"
          :options="filterRedProgrammaticAreas"
          option-value="id"
          option-label="name"
          @filter="filterProgrammaticAreas"
          label="Área de Mentoria"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Sem Resultados
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Code Input -->
        <q-input
          outlined
          label="Código"
          dense
          ref="codeRef"
          class="col q-ml-md"
          v-model="searchParams.code"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="searchParams.code = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <!-- Name Input -->
        <q-input
          outlined
          label="Nome"
          dense
          ref="nameRef"
          class="col q-ml-md"
          v-model="searchParams.name"
        >
          <template v-slot:append>
            <q-icon
              name="close"
              @click="searchParams.name = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <!-- Search and Clear Buttons -->
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

      <!-- Search Results Table -->
      <div class="q-mt-lg q-mb-md">
        <div class="row items-center q-mb-md">
          <q-icon name="search" size="sm" />
          <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
        </div>
        <q-separator color="pink-13" size="1px" />
      </div>
      <div>
        <q-table
          class="col"
          flat
          dense
          wrap-cells
          :rows="searchResults"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          :loading="isLoading"
          @request="onRequest"
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
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="programmaticArea" :props="props">
                {{ props.row.programmaticArea.name }}
              </q-td>
              <q-td key="options" :props="props">
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="isActive(props.row) ? 'green' : 'red'"
                  icon="circle"
                  @click="confirmFormLifeCycleChange(props.row)"
                >
                  <q-tooltip class="bg-green-5">{{
                    isActive(props.row)
                      ? 'Inactivar Tabela de Competências'
                      : 'Activar Tabela de Competências'
                  }}</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="yellow-9"
                  icon="edit"
                  @click="editForm(props.row)"
                >
                  <q-tooltip class="bg-green-5"
                    >Editar Tabela de Competências</q-tooltip
                  >
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <!-- Add New Competency Table Button -->
      <q-page-sticky position="bottom-right" :offset="[20, 30]" class="row">
        <q-btn round color="primary" icon="add" @click="$emit('create', true)">
          <q-tooltip class="bg-green-5"
            >Adicionar Nova Tabela de Competências</q-tooltip
          >
        </q-btn>
      </q-page-sticky>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, inject } from 'vue';
import ProgrammaticArea from 'src/stores/model/programmaticArea/ProgrammaticArea';
import Program from 'src/stores/model/program/Program';
import User from 'src/stores/model/user/User';
import UsersService from 'src/services/api/user/UsersService';
import programService from 'src/services/api/program/programService';
import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
import formService from 'src/services/api/form/formService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import useStepManager from 'src/composables/shared/systemUtils/useStepManager';
import { Loading, QSpinnerRings } from 'quasar';
import useForm from 'src/composables/form/formMethods';

import { v4 as uuid } from 'uuid';
import Form from 'stores/model/form/Form'; // Import the Step Manager composable

const props = defineProps(['params']);

const { changeStepToEdit } = useStepManager(); // Extract the function to change step to edit
const { createFormFromDTO, createDTOFromForm } = useForm();
const searchParams = ref({
  code: '',
  name: '',
  program: new Program(),
  programmaticArea: new ProgrammaticArea(),
});

const form = inject('form');
const step = inject('step');

const isSearchInitialized = ref(false);
const isLoading = ref(false);

// Pagination state
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Create a local copy of searchParams
const localSearchParams = ref({ ...props.searchParams });

const composeForms = (forms) => {
  searchResults.value = [];

  forms.forEach((formObj) => {
    // Check if the question exists in either selectedForm or addedFormQuestions
    const form = createFormFromDTO(formObj);
    searchResults.value.push(form);
  });
};

watch(
  () => props.searchParams,
  (newSearchParams) => {
    localSearchParams.value = { ...newSearchParams };
  }
);

// Search results (populated from API)
const searchResults = ref([]);
const selectedProgram = ref(null);
const selectedProgrammaticArea = ref(null);
const filterRedProgrammaticAreas = ref([]);
const { alertError, alertSucess, alertWarningAction } = useSwal();

const programmaticAreas = computed(() => {
  if (searchParams.value.program) {
    return programmaticAreaService.getProgrammaticAreasByProgramaId(
      searchParams.value.program.id
    );
  } else {
    return null;
  }
});

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    field: (row) => row.name,
    sortable: false,
  },
  {
    name: 'programmaticArea',
    align: 'left',
    label: 'Área de Mentoria',
    field: (row) => row.programmaticArea.name,
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const emit = defineEmits(['goToForms']);
const currUser = ref(new User());

onMounted(() => {
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
});

const programs = computed(() => programService.piniaGetAll());

const filterProgrammaticAreas = (val, update, abort) => {
  const stringOptions = programmaticAreas;
  if (val === '') {
    update(() => {
      filterRedProgrammaticAreas.value = stringOptions.value.map(
        (programmaticArea) => programmaticArea
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedProgrammaticAreas.value = [];
    });
  } else {
    update(() => {
      filterRedProgrammaticAreas.value = stringOptions.value
        .map((programmaticArea) => programmaticArea)
        .filter((programmaticArea) => {
          return (
            programmaticArea &&
            programmaticArea.name.toLowerCase().indexOf(val.toLowerCase()) !==
              -1
          );
        });
    });
  }
};

const onChangePrograma = () => {
  // searchParams.value.program = '';
};

const isActive = (form) => form.lifeCycleStatus === 'ACTIVE';

const confirmFormLifeCycleChange = (form) => {
  let msg =
    form.lifeCycleStatus === 'ACTIVE'
      ? 'Confirma inactivar a tabela de competências?'
      : 'Confirma activar a tabela de competências?';

  alertWarningAction(msg).then((result) => {
    if (result) {
      changeLifeCycle(form);
    }
  });
};

const changeLifeCycle = (form) => {
  form.lifeCycleStatus =
    form.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  formService
    .changeLifeCycleStatus(createDTOFromForm(form))
    .then(() => {
      alertSucess('Operação efectuada com sucesso');
      formService.update(form);
    })
    .catch((error) => {
      form.lifeCycleStatus =
        form.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      console.error('Error', error.message);
      alertError(error.message);
    });
};

// Refactor to use `useStepManager` for changing to edit step
const editForm = (formSelectedd) => {
  form.value = formSelectedd;
  emit('edit', true);
  // changeStepToEdit();
};

const search = () => {
  formService.deleteAllFromStorage();

  isLoading.value = true; // iniciar loading
  Loading.show({ spinner: QSpinnerRings });

  const params = {
    code: searchParams.value.code,
    name: searchParams.value.name,
    program: searchParams.value.program?.name,
    programmaticAreaCode: searchParams.value.programmaticArea?.name,
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  try {
    formService
      .search(params)
      .then((response) => {
        searchResults.value = [];
        if (response.status === 200 || response.status === 201) {
          if (response.data.content?.length > 0)
            composeForms(response.data.content);
          pagination.value.rowsNumber = response.data.totalSize;
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        Loading.hide();
        isLoading.value = false; // finalizar loading
      });
  } catch (error) {
    console.error(error);
  }
};

const clearSearchParams = () => {
  searchParams.value = {
    code: '',
    name: '',
    program: new Program(),
    programmaticArea: new ProgrammaticArea(),
  };
  formService.deleteAllFromStorage();
  searchResults.value = [];
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  // Update pagination state
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  // Fetch data based on the updated pagination
  search();
};
</script>
