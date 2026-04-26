package com.educentererp.module.classe;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClasseService {

    private final ClasseRepository classeRepository;

    public List<Classe> getAllClasses(){
        return classeRepository.findAll();
    }

    public Classe getClasseById(Long id) {
        return classeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classe not found with id: " + id));
    }

    public Classe createClasse(Classe classe) {
        return classeRepository.save(classe);
    }

    public Classe updateClasse(Long id, Classe updatedClasse) {
        Classe existing = getClasseById(id);
        existing.setName(updatedClasse.getName());
        existing.setSubject(updatedClasse.getSubject());
        existing.setLevel(updatedClasse.getLevel());
        existing.setSchedule(updatedClasse.getSchedule());
        existing.setTeacher(updatedClasse.getTeacher());
        existing.setMaxCapacity(updatedClasse.getMaxCapacity());
        existing.setStartDate(updatedClasse.getStartDate());
        existing.setEndDate(updatedClasse.getEndDate());
        existing.setArchived(updatedClasse.getArchived());
        return classeRepository.save(existing);
    }

    public void deleteClasse(Long id) {
        classeRepository.deleteById(id);
    }

    public List<Classe> getActiveClasses() {
        return classeRepository.findByArchived(false);
    }

}