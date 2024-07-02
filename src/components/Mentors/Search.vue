<template>
    <div class="q-pt-sm" style="height: 100%;">

        <div class="q-ma-md q-pa-md page-container">
            <div class="row">
                <q-input
                    outlined
                    label="Nome"
                    dense
                    ref="nameRef"
                    class="col"
                    v-model="searchParams.employee.name"
                >
                    <template
                    v-slot:append
                    >
                    <q-icon
                        name="close"
                        @click="searchParams.employee.name = ''"
                        class="cursor-pointer"
                    />
                    </template>
                </q-input>

                <q-input
                    outlined
                    label="NUIT"
                    dense
                    ref="nuitRef"
                    class="col q-ml-md"
                    v-model="searchParams.employee.nuit"
                >
                    <template
                    v-slot:append
                    >
                    <q-icon
                        name="close"
                        @click="searchParams.employee.nuit = ''"
                        class="cursor-pointer"
                    />
                    </template>
                </q-input>

                <q-input
                    outlined
                    label="Telefone"
                    dense
                    ref="phoneRef"
                    class="col q-ml-md"
                    v-model="searchParams.employee.phoneNumber"
                >
                    <template
                    v-slot:append
                    >
                    <q-icon
                        name="close"
                        @click="searchParams.employee.phoneNumber = ''"
                        class="cursor-pointer"
                    />
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
            <div class=" q-mt-lg q-mb-md">
                <div class="row items-center q-mb-md">
                    <q-icon name="search" size="sm" />
                    <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
                </div>
             <q-separator color="grey-13" size="1px" />
            </div>
            <div>
                <q-table
                    class="col"
                    dense
                    :rows="searchResults"
                    :columns="columns"
                    row-key="id"
                >
                <template v-slot:no-data="{ icon, filter }">
                    <div
                        class="full-width row flex-center text-primary q-gutter-sm text-body2"
                    >
                        <span> Sem resultados para visualizar </span>
                        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                    </div>
                </template>
                    <template #body="props">
                        <q-tr :props="props">
                            <q-td key="nuit" :props="props">
                                {{ props.row.employee.nuit }}
                            </q-td>
                            <q-td key="name" :props="props">
                                {{ fullName(props.row.employee) }}
                            </q-td>
                            <q-td key="category" :props="props">
                                {{ props.row.employee.professionalCategory.description }}
                            </q-td>
                            <q-td key="phoneNumber" :props="props">
                                {{ props.row.employee.phoneNumber }}
                            </q-td>
                            <q-td key="options" :props="props">
                            <div class="col">
                                <q-btn
                                flat
                                round
                                class="q-ml-md"
                                color="yellow-10"
                                icon="edit_note"
                                @click="manageMentoringAreas(props.row)"
                                >
                                <q-tooltip class="bg-green-5">Gerir áreas de mentoria</q-tooltip>
                                </q-btn>

                                <q-btn
                                flat
                                round
                                class="q-ml-md"
                                color="green-8"
                                icon="edit"
                                @click="editMentor(props.row)"
                                >
                                <q-tooltip class="bg-green-5">Detalhar/Editar Mentor</q-tooltip>
                                </q-btn>
                            </div>
                            </q-td>
                        </q-tr>
                        </template>
                </q-table>
            </div>

            <q-page-sticky position="bottom-right" :offset="[20, 30]" class="row">
                <q-fab
                    vertical-actions-align="right"
                    color="primary"
                    glossy
                    icon="add"
                    direction="left"
                >
                    <q-fab-action label-position="left" color="primary" @click="$emit('create')" icon="edit_square" label="Criar" />
                    <q-fab-action label-position="left" color="secondary" @click="$emit('import')" icon="cloud_upload" label="Importar" />
                </q-fab>
            </q-page-sticky>
        </div>
    </div>
</template>
<script setup>
import useEmployee from 'src/composables/employee/employeeMethods'
import mentorService from 'src/services/api/mentor/mentorService'
import Mentor from 'src/stores/model/mentor/Mentor'
import Employee from 'src/stores/model/employee/Employee'
import User from 'src/stores/model/user/User'
import { onMounted, ref, toRaw, inject } from 'vue'
import UsersService from 'src/services/api/user/UsersService'
import useMentor from "src/composables/mentor/mentorMethods"


const { createMentorFromDTO } = useMentor();
const searchParams = ref(new Mentor({
                            employee: new Employee()
                        }));
const { fullName } = useEmployee();
const step = inject('step');
const searchResults = ref([]);
const selectedMentor = ref('');
const columns = [
  {
    name: 'nuit',
    align: 'left',
    label: 'NUIT',
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    field: (row) => fullName(row.employee),
    sortable: false,
  },
  { name: 'category', align: 'center', label: 'Categoria Profissional', sortable: false },
  { name: 'phoneNumber', align: 'left', label: 'Telefone', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const emit = defineEmits(['goToMentoringAreas', 'import', 'edit']);
const currUser = ref(new User())

onMounted(() => {
    currUser.value = JSON.parse(JSON.stringify((UsersService.getLogedUser())));
});

const editMentor = (mentor) => {
    selectedMentor.value = mentor;
    emit('edit', mentor);
}

const clearSearchParams =()=> {
    searchParams.value = new Mentor({
        employee: new Employee()
    })
}
const search = () => {
    const params = {
        userId: currUser.value.id,
        name: searchParams.value.employee.name,
        phoneNumber: searchParams.value.employee.phoneNumber,
        nuit: searchParams.value.employee.nuit,
    }
    Object.keys(params).forEach( (key) => (params[key] === '') && delete params[key]);

    mentorService.search(params).then((response) => {
        searchResults.value = [];
        response.data.forEach((dto) => {
            searchResults.value.push(createMentorFromDTO(dto));
        })
    }).catch((error) => {
        console.error(error);
      });
};

const manageMentoringAreas = (mentor) => {
    emit('goToMentoringAreas', mentor);
}

</script>
