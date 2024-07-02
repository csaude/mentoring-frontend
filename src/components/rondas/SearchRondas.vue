<template>
    <div class="q-pt-sm" style="height: 100%;">
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
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
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
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
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
                        <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                            <span>Sem resultados para visualizar</span>
                            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                        </div>
                    </template>
                    <template #body="props">
                        <q-tr :props="props">
                            <q-td key="description" :props="props">{{ props.row.description }}</q-td>
                            <q-td key="startDate" :props="props">{{ formatDate(props.row.startDate) }}</q-td>
                            <q-td key="endDate" :props="props">{{ formatDate(props.row.endDate) }}</q-td>
                            <q-td key="healthFacility" :props="props">
                                {{ props.row.healthFacility ? props.row.healthFacility : '-' }}
                            </q-td>
                            <q-td key="mentor" :props="props">
                                {{ fullName(props.row.employee) }}
                            </q-td>
                            <q-td key="actions" :props="props">
                                <q-btn
                                        flat
                                        round
                                        class="q-ml-md"
                                        color="yellow-8"
                                        icon="edit"
                                        @click="editRonda(props.row.ronda)"
                                >
                                    <q-tooltip class="bg-green-5"
                                    >Editar Ronda</q-tooltip
                                    >
                                </q-btn>
                            </q-td>
                        </q-tr>
                    </template>
                </q-table>
            </div>
            <q-page-sticky position="bottom-right" :offset="[20, 30]" class="row">
                <q-fab vertical-actions-align="right" color="primary" glossy icon="add" direction="left">
                    <q-fab-action label-position="left" color="primary" @click="$emit('create')" icon="edit_square" label="Criar" />
                    <q-fab-action label-position="left" color="secondary" @click="$emit('import')" icon="cloud_upload" label="Importar" />
                </q-fab>
            </q-page-sticky>
        </div>
    </div>

  <q-dialog persistent v-model="showAditDialog">
    <q-card style="width: 35vw; max-width: 90vw;">
      <q-card-section>
        <div class="text-h7 bg-primary q-pa-sm text-white">Alteracao do Mentor da Ronda {{selectedRonda.description}}</div>
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
        <q-btn dense class="q-mr-sm" type="submit" color="primary" label="Gravar" @click="gravar()"></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import useEmployee from 'src/composables/employee/employeeMethods'
import mentorService from 'src/services/api/mentor/mentorService'
import Mentor from 'src/stores/model/mentor/Mentor'
import Employee from 'src/stores/model/employee/Employee'
import User from 'src/stores/model/user/User'
import { onMounted, ref, inject, computed } from 'vue'
import UsersService from 'src/services/api/user/UsersService'
import useMentor from "src/composables/mentor/mentorMethods"
import provinceService from 'src/services/api/province/provinceService';
import districtService from 'src/services/api/district/districtService';
import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
import rondaService from "src/services/api/ronda/rondaService";
import useRonda from "src/composables/ronda/rondaMethods";
import {useSwal} from "src/composables/shared/dialog/dialog";

const { createMentorFromDTO } = useMentor();
const searchParams = ref(new Mentor({
    employee: new Employee()
}));
const showAditDialog = ref(false)
const selectedRonda = ref(null)
const selectedMentor = ref(null);
const { fullName } = useEmployee();
const step = inject('step');
const searchResults = ref([]);
const options = ref([]);
const row = ref(null)
const selectedProvince = ref(null)
const selectedDistrict = ref(null)
const selectedUS = ref(null)
const filterRedDistricts = ref([]);
const unidadesSanitarias = ref([]);
const filteredMentors = ref([]);
const startDate = ref(null);
const endDate = ref(null);

// Defina as colunas da tabela
const columns = [
    { name: 'description', align: 'left', label: 'Descrição', sortable: false },
    { name: 'startDate', align: 'left', label: 'Data Início', sortable: false },
    { name: 'endDate', align: 'left', label: 'Data Fim', sortable: false },
    { name: 'healthFacility', align: 'left', label: 'Unidade Sanitária', sortable: false },
    { name: 'mentor', align: 'left', label: 'Mentor', sortable: false },
    {
        name: 'actions',
        align: 'center',
        label: 'Ações',
        sortable: false,
        field: row => row.id,
    },
];



// Formate a data para exibição
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const editRonda = async (ronda) => {
  selectedRonda.value = ronda;
  showAditDialog.value = true;

  // Carregar todos os mentores disponíveis
  const mentors = await mentorService.getMentorList();

  // Filtrar o mentor atual da ronda selecionada
  const currentMentor = ronda.rondaMentors[0]?.mentor; // Supondo que rondaMentors é um array com um único mentor
  filteredMentors.value = mentors
      .filter(mentor => mentor.id !== currentMentor.id) // Filtrar o mentor atual da lista
      .map(mentor => ({
        ...mentor,
        fullName: `${mentor.employee.name} ${mentor.employee.surname}`
      }));
};

const gravar = async () => {
  showAditDialog.value = false;
  await rondaService.changeMentor(selectedRonda.value.id, selectedMentor.value.id)
  search()
};

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
        const mentors = await mentorService.getMentorsByHealthFacilityId(selectedUS.value.id);
        filteredMentors.value = mentors.map(mentor => ({
            ...mentor,
            fullName: `${mentor.employee.name} ${mentor.employee.surname}`
        }));
    } else {
        filteredMentors.value = [];
    }
};

const mentors = computed(() => {
  return mentorService.getMentorList()
});

const districts = computed(() => {
    if (selectedProvince.value) {
        return districtService.getAllDistrictByProvinceId(selectedProvince.value.id);
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
  if (searchResults.value.length > 0){
    let res = []
    searchResults.value.forEach((ronda) => {
      ronda.rondaMentors.forEach((rm) => {
        if(!rm.endDate)
        res.push({
          description: ronda.description,
          startDate: rm.startDate,
          endDate: rm.endDate,
          healthFacility: ronda.healthFacility.healthFacility,
          employee: rm.mentor.employee,
          ronda: ronda
        })
      })
    })
    return  res
  } else {
    return  []
  }
});

const filterDistricts = (val, update, abort) => {
    const stringOptions = districts.value;
    if (val === '') {
        update(() => {
            filterRedDistricts.value = stringOptions.map(district => district);
        });
    } else if (stringOptions.length === 0) {
        update(() => {
            filterRedDistricts.value = [];
        });
    } else {
        update(() => {
            filterRedDistricts.value = stringOptions
                .map(district => district)
                .filter(district => {
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
            unidadesSanitarias.value = stringOptions.map(us => us);
        });
    } else if (stringOptions.length === 0) {
        update(() => {
            unidadesSanitarias.value = [];
        });
    } else {
        update(() => {
            unidadesSanitarias.value = stringOptions
                .map(us => us)
                .filter(us => {
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
    currUser.value = JSON.parse(JSON.stringify((UsersService.getLogedUser())));
});

const editMentor = (mentor) => {
    selectedMentor.value = mentor;
    emit('edit', mentor);
}

const search = async () => {
  if(selectedProvince.value){
    const params = {
      province: selectedProvince.value?.id,
      district: selectedDistrict.value?.id,
      healthFacility: selectedUS.value?.id,
      mentor: selectedMentor.value?.id,
      startDate: startDate.value,
      endDate: endDate.value,
    };
    Object.keys(params).forEach( (key) => (params[key] === null || params[key] === undefined) && delete params[key]);

    try {
      const response = await rondaService.search(params);
      if(response.status === 200 || response.status === 201){
        searchResults.value = []
        response.data.forEach((ronda) => {
          searchResults.value.push(rondaService.getById(ronda.id));
        })
      } else {
        useSwal().alertError('Algo correu mal na pesquisa.')
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    useSwal().alertError('A campo de provincia deve ser preenchido')
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
}
</script>
