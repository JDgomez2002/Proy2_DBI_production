import { useState, useEffect } from 'react'
import { supabase } from '../../client'
import './Otros.css'

function Otros(){
    const n = 100
    const [mortales, setMortales] = useState([])
    const [doctores, setDoctores] = useState([])
    const [pacientes, setPacientes] = useState([])
    const [medicamentosQ, setMedicamentosQ] = useState([])
    const [supplies, setSupplies] = useState([])
    let quincePorciento = 200

    const show = () => {
        enfermedades()
    }

    //top 10 de enfermedades más mortales
    async function enfermedades(){
        const {data} = await supabase
            .from('disease')
            .select()
            .order('deaths',  { ascending: false })
            .limit (10)
        const mortales = data.map((item) => item.name)
        setMortales(mortales)
    }

    const displayMortales = []; 
    for (let i = 0; i < n && i < mortales.length; i++) {
        displayMortales.push(
        <div key={mortales[i]}>
            <p>{mortales[i]}</p>
        </div>
        ); 
    }

    useEffect(() => {
        enfermedades()
        fetchTopDoctores()
        fetchPacientes()
      }, [])

    //top 10 de los doctores que más pacientes han atendido
    async function fetchTopDoctores() {
        const { data: incidenceData, error } = await supabase
          .from('incidence')
          .select('doctor_dpi')
      
        if (error) {
          console.log('Error fetching data from Supabase:', error);
          return;
        }
      
        const doctoresDPIs = incidenceData.map((item) => item.doctor_dpi)
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctor')
          .select('name, last_name, doctor_dpi')
          .in('doctor_dpi', doctoresDPIs)
      
        if (doctorError) {
          console.log('Error fetching data from Supabase:', doctorError);
          return;
        }
      
        const doctoresWithIncidences = doctorData.map((doctor) => {
          const doctorIncidences = incidenceData.filter((incidence) => incidence.doctor_dpi === doctor.doctor_dpi)
          const incidencesCount = doctorIncidences.length
          return { name: doctor.name, last_name: doctor.last_name, count: incidencesCount }
        })
      
        const sortedDoctores = doctoresWithIncidences.sort((a, b) => b.count - a.count).slice(0, 10)
        const doctores = sortedDoctores.map((item) => `${item.name} ${item.last_name}`)
      
        setDoctores(doctores);
        console.log('doctores', doctores.length);
    }
      
    //El top 5 de los pacientes con más asistencias a alguna unidad de salud y que debe de incluir su información general (peso, altura, índice de masa corporal, etc.)
    async function fetchPacientes() {
        const { data: incidenceData, error } = await supabase
          .from('incidence')
          .select('patient_dpi')
      
        const pacienteDPI = incidenceData.map((item) => item.patient_dpi)
        const { data: pacienteData, error: doctorError } = await supabase
          .from('patient')
          .select('name, last_name, patient_dpi, height, weight, body_mass_index')
          .in('patient_dpi', pacienteDPI)
      
      
        const pacientesWithIncidences = pacienteData.map((patient) => {
          const pacienteIncidence = incidenceData.filter((incidence) => incidence.patient_dpi === patient.patient_dpi)
          const incidencesCount = pacienteIncidence.length
          return { name: patient.name, last_name: patient.last_name, height: patient.height, weight: patient.weight, body_mass_index: patient.body_mass_index ,count: incidencesCount }
        })
      
        const sortedPacientes = pacientesWithIncidences.sort((a, b) => b.count - a.count).slice(0, 5)
        const pacientes = sortedPacientes.map((item) => `${item.name} ${item.last_name} ${item.height} ${item.weight} ${item.body_mass_index}`)
      
        setPacientes(pacientes);
        console.log('pacientes', pacientes.length);
    }

    //Medicinas o suministros prontos a terminar por la unidad de salud dada
    async function porTerminar() {
        const { data } = await supabase
            .from('inventory_medication')
            .select('medications_id, quantity')
            .lt('quantity', quincePorciento)
        const medicamentosId = data.map((item) => item.medications_id)

        const {data: dataMedicinas} = await supabase
            .from('medications')
            .select('name')
            .in('medications_id', medicamentosId)
        const medicamentosQ = dataMedicinas.map((item) => item.name)

        const { dataS } = await supabase
            .from('inventory_supplies')
            .select('supply_id, quantity')
            .lt('quantity', quincePorciento)
        const suppliesId = dataS.map((item) => item.supply_id)

        const {data: dataSuministros} = await supabase
            .from('supplies')
            .select('name')
            .in('supply_id', suppliesId)
        const supplies = dataSuministros.map((item) => item.name)

        setMedicamentosQ(medicamentosQ)
        setSupplies(supplies)
    }

    const displayMedicamentosCantidad = []; 
    for (let i = 0; i < n && i < medicamentosQ.length; i++) {
        displayMedicamentosCantidad.push(
        <div key={medicamentosQ[i]}>
            <p>{medicamentosQ[i]}</p>
        </div>
        ); 
    }

    const displaySupplies = []; 
    for (let i = 0; i < n && i < supplies.length; i++) {
        displaySupplies.push(
        <div key={supplies[i]}>
            <p>{supplies[i]}</p>
        </div>
        ); 
    }


    //Reporte de las 3 unidades de salud (hospitales, centros de salud y clínicas) que más pacientes atienden


    return(
        <div className="otros-root" style={{width: "100%", height: "100%"}} >
            {show()}
            <div className='otros'>
                <h1>Otra información interesante</h1>
                <hr></hr>
                <h2>Top 10 de las enfermedades más mortales</h2>
                <div className="detalles" >
                    {displayMortales}
                </div>

                <hr></hr>
                <h2>Top 10 de los médicos que más pacientes han atendido</h2>
                    <div className="detalles">
                    {doctores.map((doctorName, index) => <p key={index}>{doctorName}</p>)}
                </div>

                <hr></hr>
                <h2>Top 5 de los pacientes con más asistencias</h2>
                <div className="detalles">
                    <p> Nombre Completo | height | weight| body-mass </p>
                    {pacientes.map((patientInfo, index) => <p key={index}>{patientInfo}</p>)}
                </div>

                <hr></hr>
                <h2>Medicinas o suministros prontos a terminar</h2>
                <div className="detalles" >{}</div>
                <div className="detalles" >{}</div>

                <hr></hr>
                <h2>Top 3 de las unidades de salud que más pacientes atienden</h2>
            </div>
        </div>
    )

}
export default Otros