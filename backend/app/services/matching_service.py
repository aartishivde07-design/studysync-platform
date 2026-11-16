"""
StudySync Smart Skill Matching Service

This module implements a transparent, multi-factor weighted recommendation algorithm:
1. Required / Complementary Skill Coverage (40%)
2. Student Interest Alignment (20%)
3. Availability Compatibility (20%)
4. Learning Goal Compatibility (10%)
5. Proficiency Level Suitability (10%)

Total Normalized Score = Sum of weighted factor scores * 100%
"""

import re
from typing import List, Dict, Any
from app.models.user import User
from app.models.project import Project
from flask import current_app

PROFICIENCY_WEIGHTS = {
    'Beginner': 1.0,
    'Intermediate': 2.0,
    'Advanced': 3.0
}

def extract_keywords(text: str) -> set:
    """Extract clean lowercase keywords from freeform text for semantic matching."""
    if not text:
        return set()
    words = re.findall(r'\b[a-zA-Z0-9_\-\.\#\+]{2,}\b', text.lower())
    stopwords = {'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'want', 'learn', 'work', 'project', 'build'}
    return {w for w in words if w not in stopwords}


def calculate_jaccard_similarity(set_a: set, set_b: set) -> float:
    """Computes Jaccard Similarity index between two keyword sets (0.0 to 1.0)."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0


def parse_availability_hours(avail_str: str) -> int:
    """Parse rough hours from strings like '10-15 hrs/week', '15+ hrs/week', '5-10 hrs/week'."""
    if not avail_str:
        return 10
    avail_lower = avail_str.lower()
    if '15+' in avail_lower or '20' in avail_lower:
        return 18
    if '10-15' in avail_lower:
        return 12
    if '5-10' in avail_lower:
        return 7
    if 'weekends' in avail_lower:
        return 8
    # Try finding integers
    digits = [int(s) for s in re.findall(r'\d+', avail_str)]
    if digits:
        return sum(digits) // len(digits)
    return 10


def calculate_availability_score(avail_a: str, avail_b: str) -> float:
    """Scores compatibility between two availability descriptions (0.0 to 1.0)."""
    if not avail_a or not avail_b:
        return 0.5  # Neutral default
    if avail_a.strip().lower() == avail_b.strip().lower():
        return 1.0
    
    hours_a = parse_availability_hours(avail_a)
    hours_b = parse_availability_hours(avail_b)
    diff = abs(hours_a - hours_b)
    if diff <= 3:
        return 0.9
    elif diff <= 6:
        return 0.7
    elif diff <= 10:
        return 0.4
    return 0.2


class MatchingService:
    @staticmethod
    def get_weights():
        return {
            'skills': current_app.config.get('MATCH_WEIGHT_SKILLS', 0.40),
            'interests': current_app.config.get('MATCH_WEIGHT_INTERESTS', 0.20),
            'availability': current_app.config.get('MATCH_WEIGHT_AVAILABILITY', 0.20),
            'learning_goals': current_app.config.get('MATCH_WEIGHT_LEARNING_GOALS', 0.10),
            'proficiency': current_app.config.get('MATCH_WEIGHT_PROFICIENCY', 0.10),
        }

    @classmethod
    def match_students_for_user(cls, current_user: User, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Finds compatible peer students for the logged-in user to collaborate with.
        Looks for complementary & shared skills, common academic interests, compatible schedules.
        """
        all_other_users = User.query.filter(User.id != current_user.id).all()
        if not all_other_users:
            return []

        weights = cls.get_weights()
        current_skills = {us.skill.name.lower(): us for us in current_user.user_skills if us.skill}
        current_interests = {ui.interest.name.lower() for ui in current_user.user_interests if ui.interest}
        current_profile = current_user.profile
        current_avail = current_profile.availability if current_profile else '10-15 hrs/week'
        current_goals = extract_keywords(current_profile.learning_goals if current_profile else '')
        current_domains = set(current_profile.preferred_domains.lower().split(',')) if (current_profile and current_profile.preferred_domains) else set()

        matches = []

        for candidate in all_other_users:
            cand_profile = candidate.profile
            cand_skills = {us.skill.name.lower(): us for us in candidate.user_skills if us.skill}
            cand_interests = {ui.interest.name.lower() for ui in candidate.user_interests if ui.interest}
            cand_avail = cand_profile.availability if cand_profile else '10-15 hrs/week'
            cand_goals = extract_keywords(cand_profile.learning_goals if cand_profile else '')
            cand_domains = set(cand_profile.preferred_domains.lower().split(',')) if (cand_profile and cand_profile.preferred_domains) else set()

            # 1. Skill Score (Complementary + Shared Skills)
            shared_skills = set(current_skills.keys()).intersection(set(cand_skills.keys()))
            complementary_skills = set(cand_skills.keys()) - set(current_skills.keys())
            
            # Value complementary skills highly for collaboration, plus some shared skills for baseline communication
            skill_score = 0.0
            if current_skills or cand_skills:
                total_skills_count = max(len(current_skills), 1)
                comp_factor = min(len(complementary_skills) * 0.25, 0.6)
                shared_factor = min(len(shared_skills) * 0.2, 0.4)
                skill_score = min(comp_factor + shared_factor, 1.0)
            else:
                skill_score = 0.2  # Both have no skills listed yet

            # 2. Interest & Domain Compatibility Score
            common_interests = current_interests.intersection(cand_interests)
            common_domains = current_domains.intersection(cand_domains)
            interest_score = 0.0
            if current_interests or cand_interests:
                interest_jaccard = calculate_jaccard_similarity(current_interests, cand_interests)
                domain_overlap = 0.3 if common_domains else 0.0
                interest_score = min(interest_jaccard + domain_overlap, 1.0)
            else:
                interest_score = 0.2

            # 3. Availability Compatibility Score
            avail_score = calculate_availability_score(current_avail, cand_avail)

            # 4. Learning Goal Compatibility Score
            goal_score = calculate_jaccard_similarity(current_goals, cand_goals)
            if not current_goals and not cand_goals:
                goal_score = 0.3

            # 5. Proficiency Suitability Score
            # Checks if candidate brings intermediate/advanced proficiency
            prof_score = 0.0
            if cand_skills:
                avg_prof = sum(PROFICIENCY_WEIGHTS.get(us.proficiency, 2.0) for us in candidate.user_skills) / len(candidate.user_skills)
                prof_score = min(avg_prof / 3.0, 1.0)
            else:
                prof_score = 0.3

            # Calculate total weighted score
            total_score = (
                skill_score * weights['skills'] +
                interest_score * weights['interests'] +
                avail_score * weights['availability'] +
                goal_score * weights['learning_goals'] +
                prof_score * weights['proficiency']
            )

            # Normalize to 0 - 100 percentage
            compatibility_percentage = round(min(max(total_score, 0.05), 0.99) * 100)

            # Explainability reasons
            reasons = []
            cand_skill_names_display = {s: us.skill.name for s, us in cand_skills.items() if us.skill}
            curr_skill_names_display = {s: us.skill.name for s, us in current_skills.items() if us.skill}

            shared_display = [cand_skill_names_display.get(s, s.title()) for s in shared_skills]
            comp_display = [cand_skill_names_display.get(s, s.title()) for s in complementary_skills]

            if shared_display:
                sample_shared = shared_display[:3]
                reasons.append(f"Shared technical foundation in {', '.join(sample_shared)}")
            if comp_display:
                sample_comp = comp_display[:3]
                reasons.append(f"Brings complementary expertise in {', '.join(sample_comp)}")
            if common_interests:
                reasons.append(f"Mutual interest in {', '.join([i.title() for i in list(common_interests)[:2]])}")
            if avail_score >= 0.8:
                reasons.append(f"Compatible schedule commitment ({cand_avail})")
            if not reasons:
                reasons.append("Both actively seeking student collaborators in matching departments")

            matches.append({
                'candidate': candidate.to_dict(),
                'compatibility_score': compatibility_percentage,
                'breakdown': {
                    'skill_coverage': round(skill_score * 100),
                    'interest_compatibility': round(interest_score * 100),
                    'availability_compatibility': round(avail_score * 100),
                    'goal_compatibility': round(goal_score * 100),
                    'proficiency_suitability': round(prof_score * 100)
                },
                'reasons': reasons,
                'shared_skills': shared_display,
                'complementary_skills': comp_display
            })

        # Sort highest-scoring first
        matches.sort(key=lambda m: m['compatibility_score'], reverse=True)
        return matches[:limit]

    @classmethod
    def match_students_for_project(cls, project: Project, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Finds registered students who best fit the requirements of a specific project.
        Calculates coverage of required skills, domain interest, availability and proficiency.
        """
        # Exclude project creator and existing team members
        excluded_ids = {project.creator_id}
        if project.team:
            for tm in project.team.members:
                excluded_ids.add(tm.user_id)

        candidates = User.query.filter(~User.id.in_(excluded_ids)).all()
        if not candidates:
            return []

        weights = cls.get_weights()
        req_skills_map = {prs.skill.name.lower(): prs for prs in project.required_skills if prs.skill}
        proj_domain = project.domain.lower() if project.domain else ''
        proj_keywords = extract_keywords(project.description) | extract_keywords(project.title)

        matches = []

        for candidate in candidates:
            cand_profile = candidate.profile
            cand_skills = {us.skill.name.lower(): us for us in candidate.user_skills if us.skill}
            cand_interests = {ui.interest.name.lower() for ui in candidate.user_interests if ui.interest}
            cand_avail = cand_profile.availability if cand_profile else '10-15 hrs/week'
            cand_goals = extract_keywords(cand_profile.learning_goals if cand_profile else '')

            # 1. Required Skill Coverage Score
            matched_req_skills = []
            missing_req_skills = []
            skill_score = 0.0
            prof_score = 0.0

            if req_skills_map:
                for skill_name, prs in req_skills_map.items():
                    canonical_name = prs.skill.name if prs.skill else skill_name.title()
                    if skill_name in cand_skills:
                        matched_req_skills.append(canonical_name)
                        # Check proficiency suitability
                        cand_prof_val = PROFICIENCY_WEIGHTS.get(cand_skills[skill_name].proficiency, 2.0)
                        req_prof_val = PROFICIENCY_WEIGHTS.get(prs.proficiency_level, 2.0)
                        # Bonus if candidate meets or exceeds required proficiency
                        if cand_prof_val >= req_prof_val:
                            prof_score += 1.0
                        else:
                            prof_score += (cand_prof_val / req_prof_val)
                    else:
                        missing_req_skills.append(canonical_name)

                skill_score = len(matched_req_skills) / len(req_skills_map)
                prof_score = prof_score / len(req_skills_map) if req_skills_map else 0.5
            else:
                # If project didn't specify required skills, evaluate based on general skills
                skill_score = 0.5 if cand_skills else 0.2
                prof_score = 0.5

            # 2. Interest / Domain Match Score
            interest_score = 0.0
            domain_matched = False
            for interest in cand_interests:
                if interest in proj_domain or proj_domain in interest:
                    domain_matched = True
                    break
            if cand_profile and cand_profile.preferred_domains:
                if proj_domain in cand_profile.preferred_domains.lower():
                    domain_matched = True

            shared_keywords = cand_goals.intersection(proj_keywords)
            interest_score = 0.6 if domain_matched else 0.2
            if shared_keywords:
                interest_score = min(interest_score + 0.3, 1.0)

            # 3. Availability Compatibility Score
            avail_score = calculate_availability_score(project.availability_requirement, cand_avail)

            # 4. Learning Goal Compatibility Score
            goal_score = 0.7 if shared_keywords else 0.3

            # Calculate total weighted score
            total_score = (
                skill_score * weights['skills'] +
                interest_score * weights['interests'] +
                avail_score * weights['availability'] +
                goal_score * weights['learning_goals'] +
                prof_score * weights['proficiency']
            )

            compatibility_percentage = round(min(max(total_score, 0.05), 0.99) * 100)

            # Explainability reasons
            reasons = []
            if matched_req_skills:
                reasons.append(f"Mastery in required skills: {', '.join(matched_req_skills[:3])}")
            if domain_matched:
                reasons.append(f"Strong interest in {project.domain}")
            if avail_score >= 0.8:
                reasons.append(f"Meets availability requirement ({project.availability_requirement})")
            if prof_score >= 0.8 and matched_req_skills:
                reasons.append("Skill proficiency aligns with or exceeds project demands")
            if not reasons:
                reasons.append("Enthusiastic applicant with foundational college background")

            matches.append({
                'candidate': candidate.to_dict(),
                'compatibility_score': compatibility_percentage,
                'breakdown': {
                    'required_skill_coverage': round(skill_score * 100),
                    'domain_interest_match': round(interest_score * 100),
                    'availability_compatibility': round(avail_score * 100),
                    'goal_alignment': round(goal_score * 100),
                    'proficiency_suitability': round(prof_score * 100)
                },
                'matched_skills': matched_req_skills,
                'missing_skills': missing_req_skills,
                'reasons': reasons
            })

        matches.sort(key=lambda m: m['compatibility_score'], reverse=True)
        return matches[:limit]
