<template>
  <q-page>
    <div class="q-pt-sm" style="height: 100%">
      <div class="q-ma-md q-pa-md page-container">
        <div>
          <q-table
            class="col"
            dense
            :rows="searchResults"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 20, 50, 100]"
            :filter="filter"
            :loading="loading"
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
                <q-td key="healthFacility" :props="props">
                  <span v-if="isEditable(props.row)">
                    <q-input
                      outlined
                      label="Unidade Sanitaria"
                      dense
                      v-model="data.healthFacility"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="close"
                          @click="clearField('healthFacility')"
                          class="cursor-pointer"
                        />
                      </template>
                    </q-input>
                  </span>
                  <span v-else>{{ props.row.healthFacility }}</span>
                </q-td>

                <q-td key="province" :props="props">
                  <span v-if="isEditable(props.row)">
                    <q-select
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      dense
                      outlined
                      v-model="data.province"
                      :options="provinces"
                      option-value="id"
                      option-label="designation"
                      label="Provincias"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey"
                            >Sem Resultados</q-item-section
                          >
                        </q-item>
                      </template>
                    </q-select>
                  </span>
                  <span v-else>{{
                    props.row.district.province?.designation
                  }}</span>
                </q-td>

                <q-td key="district" :props="props">
                  <span v-if="isEditable(props.row)">
                    <q-select
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      dense
                      outlined
                      v-model="data.district"
                      :options="districts"
                      option-value="id"
                      option-label="description"
                      label="Distritos"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey"
                            >Sem Resultados</q-item-section
                          >
                        </q-item>
                      </template>
                    </q-select>
                  </span>
                  <span v-else>{{ props.row.district.description }}</span>
                </q-td>

                <q-td key="options" :props="props">
                  <div class="col">
                    <template v-if="props.row.id === null">
                      <q-btn
                        @click="submitForm"
                        class="q-ml-md q-mb-xs float-right"
                        square
                        color="primary"
                        icon="save"
                      >
                        <q-tooltip class="bg-green-5">Salvar</q-tooltip>
                      </q-btn>
                      <q-btn
                        @click="closeForm"
                        class="q-ml-md q-mb-xs float-right"
                        square
                        color="amber"
                        icon="close"
                      >
                        <q-tooltip class="bg-amber-5">Fechar</q-tooltip>
                      </q-btn>
                    </template>
                    <template v-else>
                      <q-btn
                        flat
                        round
                        class="q-ml-md"
                        color="green-8"
                        icon="edit"
                        @click="editHealthFacility(props.row)"
                      >
                        <q-tooltip class="bg-green-5"
                          >Detalhar/Editar Program</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        v-if="selectedHealthFacility.id === props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        color="green-8"
                        icon="done"
                        @click="saveUpdate(props.row)"
                      >
                        <q-tooltip class="bg-green-5"
                          >Guardar Alteração</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        v-if="selectedHealthFacility.id === props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        color="red-8"
                        icon="close"
                        @click="discardChanges"
                      >
                        <q-tooltip class="bg-green-5"
                          >Descartar Alteração</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        flat
                        round
                        class="q-ml-md"
                        color="red-8"
                        icon="delete"
                        @click="deleteHealthFacility(props.row.id)"
                      >
                      </q-btn>
                    </template>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
        <q-page-sticky position="bottom-right" :offset="[20, 30]" class="row">
          <q-fab color="primary" glossy icon="add" @click="addNewRow" />
        </q-page-sticky>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch } from 'vue';
import useEmployee from 'src/composables/employee/employeeMethods';
import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
import UsersService from 'src/services/api/user/UsersService';
import districtService from 'src/services/api/district/districtService';
import provinceService from 'src/services/api/province/provinceService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import User from 'src/stores/model/user/User';
import { useLoading } from 'src/composables/shared/loading/loading';
import useHealthFacility from 'src/composables/healthFacility/healthFacility';

const { createHealthFacilityFromDTO } = useHealthFacility();

const { closeLoading, showloading } = useLoading();
const { alertError, alertSucess, alertWarningAction } = useSwal();
const { fullName } = useEmployee();
const step = inject('step');
const searchResults = ref([]);
const loading = ref(true);

const selectedHealthFacility = ref('');
const newRowAdded = ref(false);
const data = ref({ healthFacility: '', province: '', district: '' });
const openForm = ref(false);
const columns = [
  {
    name: 'healthFacility',
    align: 'left',
    label: 'Unidade sanitária',
    sortable: false,
  },
  { name: 'province', align: 'left', label: 'Provincia', sortable: false },
  { name: 'district', align: 'left', label: 'Distrito', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  // Atualiza o estado de paginação
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  loadData();
};

const emit = defineEmits(['goToHealthFacilityingAreas']);
const currUser = ref(new User());

onMounted(() => {
  showloading();
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
  loadData();
  closeLoading();
});

const loadData = () => {
  loading.value = true;
  search();
};

const search = async () => {
  const params = {
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  healthFacilityService
    .getAll(params)
    .then((response) => {
      searchResults.value = [];
      response.data.content.forEach((dto) => {
        searchResults.value.push(createHealthFacilityFromDTO(dto));
      });
      pagination.value.rowsNumber = response.data.totalPages;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const provinces = computed(() => provinceService.piniaGetAll());

const districts = computed(() => {
  const allDistricts = districtService.piniaGetAll();
  return data.value.province
    ? allDistricts.filter((d) => d.province_id == data.value.province.id)
    : [];
});

const isEditable = (row) =>
  row.id === null || selectedHealthFacility.value.id === row.id;

const submitForm = () => {
  const healthFacility = {
    healthFacility: data.value.healthFacility,
    districtDTO: data.value.district,
  };
  healthFacilityService.saveHealthFacility(healthFacility).then((res) => {
    closeForm();
    newRowAdded.value = false;
    healthFacilityService.getAll().then((results) => {
      searchResults.value = healthFacilityService.piniaGetAll();
      loading.value = false;
    });
  });
};

const closeForm = () => {
  discardChanges();
  removeRow();
  openForm.value = false;
};

const editHealthFacility = (healthFacility) => {
  removeRow();
  openForm.value = false;
  selectedHealthFacility.value = healthFacility;
  data.value = {
    ...healthFacility,
    province: healthFacility.district.province,
  };
};

const saveUpdate = () => {
  const healthFacility = { id: selectedHealthFacility.value.id, ...data.value };
  healthFacility.district = data.value.district;
  healthFacilityService
    .updateHealthFacility(
      useHealthFacility().createDTOFromHealthFacility(healthFacility)
    )
    .then((res) => {
      healthFacilityService.getAll().then(() => {
        searchResults.value = healthFacilityService.piniaGetAll();
        loading.value = false;
        discardChanges();
        resetFields();
      });
    });
};

const resetFields = () => {
  selectedHealthFacility.value = {};
  data.value = { healthFacility: '', province: '', district: '' };
};

const discardChanges = () => {
  selectedHealthFacility.value = {};
};

const deleteHealthFacility = (id) => {
  alertWarningAction('Tem certeza que deseja apagar a unidade sanitaria?').then(
    (result) => {
      if (result) {
        healthFacilityService
          .deleteHealthFacility(id)
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              alertSucess('Unidade sanitaria apagada com sucesso!').then(
                (result) => {
                  healthFacilityService.getAll().then((res) => {
                    searchResults.value = healthFacilityService.piniaGetAll();
                    loading.value = false;
                  });
                }
              );
            } else {
              alertError('Não foi possivel apagar a unidade sanitaria.');
            }
          })
          .catch(alertError);
      }
    }
  );
};

const addNewRow = () => {
  discardChanges();
  openForm.value = true;
  if (!newRowAdded.value) {
    newRowAdded.value = true;
    searchResults.value.unshift({
      id: null,
      healthFacility: '',
      province: '',
      district: '',
      acao: 'NOVA_LINHA',
    });
  } else {
    alertError('Há uma área sendo associado.');
  }
};

const removeRow = () => {
  if (openForm.value) {
    const index = searchResults.value.findIndex((item) => item.id === null);
    searchResults.value.splice(index, 1);
    newRowAdded.value = false;
  }
};

/*watch(searchResults, (newValue) => {
  if (!Array.isArray(newValue)) {
    console.error('searchResults não é um array!', newValue);
  }
});*/

const clearField = (field) => {
  data.value[field] = '';
};

watch(
  () => pagination.value.page,
  (newPage) => {
    loadData();
  }
);
</script>
